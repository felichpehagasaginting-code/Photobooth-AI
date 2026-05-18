import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// ─── API Keys (from environment only – never hardcode!) ──────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || ''; // optional, works without key

// ─── Helpers ─────────────────────────────────────────────────────────────────
function stripBase64Prefix(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// ─── Provider 1: Gemini (image-to-image) ─────────────────────────────────────
async function tryGemini(image: string, filterPrompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
    console.log('[generate-filter] Gemini: no API key, skipping');
    return null;
  }

  const { mimeType, data } = stripBase64Prefix(image);

  // If using OpenRouter
  if (GEMINI_API_KEY.startsWith('sk-or-')) {
    console.log('[generate-filter] Trying Gemini via OpenRouter (google/gemini-2.5-flash)…');
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GEMINI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: filterPrompt },
              { type: 'image_url', image_url: { url: `data:${mimeType};base64,${data}` } },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      console.warn('[generate-filter] OpenRouter error:', await res.text());
      return null;
    }

    const result = await res.json();
    const content = result.choices?.[0]?.message?.content;
    if (content) {
      // If the model returns base64 or an image URL in content, handle it here.
      // Often, base64 images might be raw or wrapped. If it's a URL, we'd need to fetch it.
      // Assuming it tries to return base64 text:
      console.log('[generate-filter] OpenRouter: success');
      if (content.startsWith('data:image')) return content;
      return `data:image/jpeg;base64,${content}`;
    }
    return null;
  }

  // Fallback to official Google API
  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const contents = [
    { text: filterPrompt },
    { inlineData: { mimeType, data } },
  ];

  console.log('[generate-filter] Trying Gemini (gemini-2.5-flash-image)…');
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents,
  });

  const parts = response.candidates?.[0]?.content?.parts;
  const imagePart = parts?.find((p: any) => p.inlineData);
  if (!imagePart?.inlineData?.data) return null;

  const outputMime = imagePart.inlineData.mimeType || 'image/png';
  console.log('[generate-filter] Gemini: success');
  return `data:${outputMime};base64,${imagePart.inlineData.data}`;
}

// ─── Provider 2: Pollinations.ai (image-to-image via flux/gptimage) ──────────
async function tryPollinations(image: string, filterPrompt: string): Promise<string | null> {
  const { data: base64Data, mimeType } = stripBase64Prefix(image);

  try {
    // Upload image to Pollinations media storage first, then use as reference
    // Pollinations supports image-to-image via the `image` query param
    // Strategy: encode original image as URL encode, use flux model
    const imageUrl = `data:${mimeType};base64,${base64Data}`;

    // Use Pollinations OpenAI-compatible image generation endpoint
    const body: Record<string, any> = {
      prompt: filterPrompt,
      model: 'flux',
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
    };

    // If we have original image, pass as reference for img2img
    if (image) {
      body.image = imageUrl;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (POLLINATIONS_API_KEY) {
      headers['Authorization'] = `Bearer ${POLLINATIONS_API_KEY}`;
    }

    console.log('[generate-filter] Trying Pollinations.ai (flux)…');

    const res = await fetch('https://gen.pollinations.ai/v1/images/generations', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(90_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[generate-filter] Pollinations error:', res.status, errText.slice(0, 200));

      // Try alternative: direct image URL with GET (no key needed)
      // Encode prompt + use image as reference
      return await tryPollinationsDirect(imageUrl, filterPrompt);
    }

    const result = await res.json();
    const b64Json = result.data?.[0]?.b64_json;
    if (b64Json) {
      console.log('[generate-filter] Pollinations (API): success');
      return `data:image/jpeg;base64,${b64Json}`;
    }

    return null;
  } catch (err) {
    console.warn('[generate-filter] Pollinations API error:', String(err).slice(0, 200));
    // Fallback to direct GET URL
    return await tryPollinationsDirect(
      `data:${mimeType};base64,${base64Data}`,
      filterPrompt
    );
  }
}

// ─── Pollinations Direct GET (no API key needed) ─────────────────────────────
async function tryPollinationsDirect(
  imageDataUrl: string,
  filterPrompt: string
): Promise<string | null> {
  try {
    // URL-encode the prompt and use direct GET endpoint
    const encodedPrompt = encodeURIComponent(filterPrompt);

    // Pollinations free direct URL - returns the generated image
    const url = `https://gen.pollinations.ai/image/${encodedPrompt}?model=flux&width=1024&height=1024&nofeed=true`;

    console.log('[generate-filter] Trying Pollinations.ai direct GET…');

    const res = await fetch(url, {
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      console.warn('[generate-filter] Pollinations direct error:', res.status);
      return null;
    }

    const resultBuffer = await res.arrayBuffer();
    const resultBase64 = Buffer.from(resultBuffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    console.log('[generate-filter] Pollinations (direct): success, size:', resultBase64.length);
    return `data:${contentType};base64,${resultBase64}`;
  } catch (err) {
    console.warn('[generate-filter] Pollinations direct failed:', String(err).slice(0, 200));
    return null;
  }
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { image, filterPrompt, style } = body;

    console.log('[generate-filter] Request received, style:', style, 'prompt:', filterPrompt?.slice(0, 60));

    if (!filterPrompt) {
      return NextResponse.json({ error: 'Missing required field: filterPrompt' }, { status: 400 });
    }
    if (!image) {
      return NextResponse.json({ error: 'Missing required field: image' }, { status: 400 });
    }

    // ── Try Gemini first ──────────────────────────────────────────────────────
    try {
      const geminiResult = await tryGemini(image, filterPrompt);
      if (geminiResult) {
        return NextResponse.json({
          filteredImage: geminiResult,
          style,
          prompt: filterPrompt,
          provider: 'gemini',
        });
      }
    } catch (geminiErr: any) {
      const msg = String(geminiErr);
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        console.warn('[generate-filter] Gemini quota exceeded, falling back to Pollinations…');
      } else {
        console.warn('[generate-filter] Gemini error:', msg.slice(0, 200));
      }
    }

    // ── Try Pollinations.ai ───────────────────────────────────────────────────
    try {
      const plResult = await tryPollinations(image, filterPrompt);
      if (plResult) {
        return NextResponse.json({
          filteredImage: plResult,
          style,
          prompt: filterPrompt,
          provider: 'pollinations',
        });
      }
    } catch (plErr: any) {
      console.warn('[generate-filter] Pollinations error:', String(plErr).slice(0, 200));
    }

    // ── All providers failed – return original image ──────────────────────────
    console.warn('[generate-filter] All AI providers unavailable, returning original');
    return NextResponse.json({
      filteredImage: image,
      style,
      prompt: filterPrompt,
      provider: 'fallback-original',
      warning: 'AI providers unavailable. Returning original photo. Add GEMINI_API_KEY to .env.local for best results. Pollinations.ai is free without key.',
    });
  } catch (error) {
    console.error('[generate-filter] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Filter generation failed', details: String(error) },
      { status: 500 }
    );
  }
}