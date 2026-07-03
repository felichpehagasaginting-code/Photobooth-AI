import { NextResponse } from 'next/server';
import { nvidiaAI } from '@/lib/nvidia-ai';

// ─── API Keys (from environment only – never hardcode!) ──────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const POLLINATIONS_API_KEY = process.env.POLLINATIONS_API_KEY || '';
const NVIDIA_QWEN_API_KEY = process.env.NVIDIA_QWEN_API_KEY || '';
const NVIDIA_QWEN_MODEL = process.env.NVIDIA_QWEN_MODEL || 'qwen/qwen2.5-vl-72b-instruct';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function stripBase64Prefix(dataUrl: string): { mimeType: string; data: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return { mimeType: match[1], data: match[2] };
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// ─── Provider 1: Gemini via REST API (image-to-image) ─────────────────────────
const GEMINI_MODELS = [
  'gemini-3.1-flash-image',
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-lite-image',
  'gemini-2.5-flash',
];

export async function tryGemini(image: string, filterPrompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.length < 10) {
    console.log('[generate-filter] Gemini: no API key, skipping');
    return null;
  }

  const { mimeType, data } = stripBase64Prefix(image);

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[generate-filter] Trying Gemini (${model})…`);

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: filterPrompt },
                { inlineData: { mimeType, data } },
              ],
            }],
          }),
          signal: AbortSignal.timeout(30_000),
        }
      );

      if (!res.ok) {
        const errBody = await res.text();
        console.warn(`[generate-filter] Gemini (${model}) error ${res.status}:`, errBody.slice(0, 200));
        continue;
      }

      const json = await res.json();
      const parts = json?.candidates?.[0]?.content?.parts || [];

      // Check for image in response
      const imagePart = parts.find((p: any) => p.inlineData);
      if (imagePart?.inlineData?.data) {
        const outputMime = imagePart.inlineData.mimeType || 'image/png';
        console.log(`[generate-filter] Gemini (${model}): image success`);
        return `data:${outputMime};base64,${imagePart.inlineData.data}`;
      }

      // Text response (no image generated)
      const text = parts.map((p: any) => p.text).filter(Boolean).join(' ');
      if (text) {
        console.log(`[generate-filter] Gemini (${model}) returned text (${text.length} chars), trying next model`);
      }
    } catch (err: any) {
      console.warn(`[generate-filter] Gemini (${model}) exception:`, String(err).slice(0, 200));
    }
  }

  return null;
}

// ─── Provider 2: Pollinations.ai (image-to-image via flux/gptimage) ──────────
export async function tryPollinations(image: string, filterPrompt: string): Promise<string | null> {
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

// ─── Provider 3: NVIDIA Qwen VL (image-to-image via chat completions) ──────────
export async function tryQwen(image: string, filterPrompt: string): Promise<string | null> {
  if (!NVIDIA_QWEN_API_KEY || NVIDIA_QWEN_API_KEY.length < 10) {
    console.log('[generate-filter] Qwen: no API key, skipping');
    return null;
  }

  try {
    const { mimeType, data } = stripBase64Prefix(image);
    const imageDataUrl = `data:${mimeType};base64,${data}`;

    console.log(`[generate-filter] Trying Qwen (${NVIDIA_QWEN_MODEL})…`);

    const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NVIDIA_QWEN_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        model: NVIDIA_QWEN_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: imageDataUrl } },
              { type: 'text', text: filterPrompt },
            ],
          },
        ],
        max_tokens: 4096,
        temperature: 0.7,
        top_p: 0.95,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[generate-filter] Qwen error:', res.status, errText.slice(0, 200));
      return null;
    }

    const json = await res.json();
    const content = json.choices?.[0]?.message?.content;

    if (content) {
      // Qwen might return a data URL or base64 image
      if (content.startsWith('data:image')) return content;
      if (content.length > 1000) {
        // Might be raw base64 image data
        try {
          return `data:image/jpeg;base64,${content}`;
        } catch {
          return content;
        }
      }
      console.log('[generate-filter] Qwen returned text response (not an image), content:', content.slice(0, 100));
    }

    return null;
  } catch (err) {
    console.warn('[generate-filter] Qwen failed:', String(err).slice(0, 200));
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

    // ── Apply NVIDIA Nemotron-3 Ultra Prompt Enhancement ───────────────────────
    let enhancedPrompt = filterPrompt;
    let nvidiaReasoning = '';
    if (nvidiaAI.isConfigured) {
      try {
        console.log('[generate-filter] Enhancing prompt with NVIDIA Nemotron-3 Ultra…');
        const enhancement = await nvidiaAI.enhancePrompt(
          'A portrait photo from a photobooth session',
          filterPrompt,
          style || 'artistic'
        );
        enhancedPrompt = enhancement.enhancedPrompt;
        nvidiaReasoning = enhancement.reasoning;
        console.log('[generate-filter] NVIDIA enhancement applied. Enhanced prompt:', enhancedPrompt.slice(0, 80));
      } catch (nvErr: any) {
        console.warn('[generate-filter] NVIDIA enhancement failed, using original prompt:', String(nvErr).slice(0, 200));
      }
    } else {
      console.log('[generate-filter] NVIDIA API not configured. Using original prompt. Add NVIDIA_API_KEY to .env.local');
    }

    // ── Try Gemini first ──────────────────────────────────────────────────────
    try {
      const geminiResult = await tryGemini(image, enhancedPrompt);
      if (geminiResult) {
        return NextResponse.json({
          filteredImage: geminiResult,
          style,
          prompt: enhancedPrompt,
          originalPrompt: filterPrompt,
          provider: 'gemini+nvidia',
          nvidiaReasoning: nvidiaReasoning || undefined,
        });
      }
    } catch (geminiErr: any) {
      const msg = String(geminiErr);
      console.warn('[generate-filter] Gemini error details:', msg.slice(0, 500));
      if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED') || msg.includes('quota')) {
        console.warn('[generate-filter] Gemini quota exceeded or model unavailable, falling back to Qwen…');
      } else {
        console.warn('[generate-filter] Gemini failed with non-quota error, falling back to Qwen…');
      }
    }

    // ── Try NVIDIA Qwen VL ────────────────────────────────────────────────────
    try {
      const qwenResult = await tryQwen(image, enhancedPrompt);
      if (qwenResult) {
        return NextResponse.json({
          filteredImage: qwenResult,
          style,
          prompt: enhancedPrompt,
          originalPrompt: filterPrompt,
          provider: 'qwen+nvidia',
          nvidiaReasoning: nvidiaReasoning || undefined,
        });
      }
    } catch (qwenErr: any) {
      console.warn('[generate-filter] Qwen error:', String(qwenErr).slice(0, 200));
    }

    // ── Try Pollinations.ai ───────────────────────────────────────────────────
    try {
      const plResult = await tryPollinations(image, enhancedPrompt);
      if (plResult) {
        return NextResponse.json({
          filteredImage: plResult,
          style,
          prompt: enhancedPrompt,
          originalPrompt: filterPrompt,
          provider: 'pollinations+nvidia',
          nvidiaReasoning: nvidiaReasoning || undefined,
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
      enhancedPrompt,
      originalPrompt: filterPrompt,
      provider: 'fallback-original',
      nvidiaReasoning: nvidiaReasoning || undefined,
      warning: 'AI providers unavailable. Returning original photo. Add GEMINI_API_KEY to .env.local for best results, or NVIDIA_API_KEY for prompt enhancement.',
    });
  } catch (error) {
    console.error('[generate-filter] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Filter generation failed', details: String(error) },
      { status: 500 }
    );
  }
}