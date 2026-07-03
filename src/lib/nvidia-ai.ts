type NVStreamChunk = {
  choices?: Array<{
    delta: { content?: string; reasoning_content?: string };
    finish_reason?: string | null;
  }>;
};

export class NvidiaAI {
  private baseUrl: string;
  private apiKey: string;
  private model: string;

  constructor() {
    this.baseUrl = process.env.NVIDIA_API_URL || 'https://integrate.api.nvidia.com/v1';
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.model = process.env.NVIDIA_MODEL || 'moonshotai/kimi-k2.6';
  }

  get isConfigured(): boolean {
    return this.apiKey.length > 10;
  }

  private buildHeaders(stream = false): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': stream ? 'text/event-stream' : 'application/json',
    };
  }

  private buildPayload(
    messages: Array<{ role: string; content: string }>,
    opts: {
      temperature?: number;
      topP?: number;
      maxTokens?: number;
      stream?: boolean;
      reasoningBudget?: number;
    } = {}
  ): Record<string, any> {
    return {
      model: this.model,
      messages,
      max_tokens: opts.reasoningBudget ?? opts.maxTokens ?? 4096,
      temperature: opts.temperature ?? 0.7,
      top_p: opts.topP ?? 0.95,
      stream: opts.stream ?? false,
      chat_template_kwargs: { thinking: true },
    };
  }

  async enhancePrompt(
    photoDescription: string,
    basePrompt: string,
    style: string
  ): Promise<{ enhancedPrompt: string; reasoning: string }> {
    const systemMsg = `You are a professional AI photo editor with deep expertise in artistic filters and photography styles. Your task is to ENHANCE the given filter prompt with specific, vivid details that will produce the best possible AI-generated image result. Be concrete — mention lighting, color palette, texture, mood, and technical photography terms. Keep the original intent but make it more detailed and visually specific. Return ONLY the enhanced prompt, no explanations.`;

    const userMsg = `Photo context: ${photoDescription || 'A standard portrait photo'}
Original filter style: ${style}
Original prompt: ${basePrompt}

Generate an enhanced, highly detailed version of this prompt for optimal AI image generation:`;

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(this.buildPayload(
          [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          { temperature: 0.8, maxTokens: 2048, reasoningBudget: 4096 }
        )),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('[NVIDIA] enhancePrompt API error:', res.status, errText.slice(0, 200));
        return { enhancedPrompt: basePrompt, reasoning: '' };
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || basePrompt;
      const reasoning = json.choices?.[0]?.message?.reasoning_content || '';

      const clean = content.replace(/^["'\s]+|["'\s]+$/g, '');
      return { enhancedPrompt: clean || basePrompt, reasoning };
    } catch (err) {
      console.warn('[NVIDIA] enhancePrompt failed:', String(err).slice(0, 200));
      return { enhancedPrompt: basePrompt, reasoning: '' };
    }
  }

  async suggestFilters(
    capturedPhotos: string[],
    availableFilters: Array<{ name: string; description: string; style: string }>
  ): Promise<{
    suggestions: Array<{ filterName: string; score: number; reason: string }>;
    reasoning: string;
  }> {
    const photoCount = capturedPhotos.length;
    const filterList = availableFilters
      .map(f => `- ${f.name} (${f.style}): ${f.description}`)
      .join('\n');

    const systemMsg = `You are a professional photography director and photo editor AI. Analyze the photo session and recommend the best filters from the available list. Consider: photo count (${photoCount}), style compatibility, visual coherence across all photos, and professional editing workflow. Output JSON with filter recommendations scored 0-10.`;

    const userMsg = `Available filters:\n${filterList}\n\nRecommend the top 3 filters for this session. Return ONLY valid JSON: { "suggestions": [{ "filterName": "...", "score": 0-10, "reason": "short reason" }] }`;

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify(this.buildPayload(
          [
            { role: 'system', content: systemMsg },
            { role: 'user', content: userMsg },
          ],
          { temperature: 0.7, maxTokens: 2048, reasoningBudget: 4096 }
        )),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.warn('[NVIDIA] suggestFilters API error:', res.status, errText.slice(0, 200));
        return { suggestions: [], reasoning: '' };
      }

      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '{}';
      const reasoning = json.choices?.[0]?.message?.reasoning_content || '';

      try {
        const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
        return { suggestions: parsed.suggestions || [], reasoning };
      } catch {
        console.warn('[NVIDIA] Failed to parse filter suggestion JSON');
        return { suggestions: [], reasoning };
      }
    } catch (err) {
      console.warn('[NVIDIA] suggestFilters failed:', String(err).slice(0, 200));
      return { suggestions: [], reasoning: '' };
    }
  }

  async *streamReasoning(prompt: string): AsyncGenerator<{
    token?: string;
    reasoning?: string;
    done: boolean;
  }> {
    if (!this.isConfigured) {
      yield { done: true };
      return;
    }

    try {
      const res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.buildHeaders(true),
        body: JSON.stringify(this.buildPayload(
          [{ role: 'user', content: prompt }],
          { stream: true, maxTokens: 4096, reasoningBudget: 8192 }
        )),
      });

      if (!res.ok) {
        console.warn('[NVIDIA] streamReasoning error:', res.status);
        yield { done: true };
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) {
        yield { done: true };
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            yield { done: true };
            return;
          }

          try {
            const chunk: NVStreamChunk = JSON.parse(data);
            const choice = chunk.choices?.[0];
            if (!choice) continue;

            yield {
              token: choice.delta?.content,
              reasoning: choice.delta?.reasoning_content,
              done: choice.finish_reason === 'stop',
            };
          } catch {
            // skip malformed JSON
          }
        }
      }

      yield { done: true };
    } catch (err) {
      console.warn('[NVIDIA] streamReasoning failed:', String(err).slice(0, 200));
      yield { error: String(err), done: true };
    }
  }
}

export const nvidiaAI = new NvidiaAI();
