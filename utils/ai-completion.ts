import type { AiProviderId } from '@/utils/messages';

async function readErrorSnippet(res: Response): Promise<string> {
  const text = await res.text();
  const trimmed = text.trim().slice(0, 500);
  return trimmed || res.statusText || `HTTP ${res.status}`;
}

export async function runAiCompletion(
  provider: AiProviderId,
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!apiKey.trim()) {
    throw new Error('API key is missing. Add it in extension settings.');
  }

  switch (provider) {
    case 'openai':
      return completionOpenAiCompatible(
        'https://api.openai.com/v1/chat/completions',
        apiKey,
        'gpt-4o-mini',
        systemPrompt,
        userPrompt,
      );
    case 'deepseek':
      return completionOpenAiCompatible(
        'https://api.deepseek.com/v1/chat/completions',
        apiKey,
        'deepseek-chat',
        systemPrompt,
        userPrompt,
      );
    case 'anthropic':
      return completionAnthropic(apiKey, systemPrompt, userPrompt);
    case 'google':
      return completionGemini(apiKey, systemPrompt, userPrompt);
    default: {
      const _exhaustive: never = provider;
      return _exhaustive;
    }
  }
}

async function completionOpenAiCompatible(
  endpoint: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorSnippet(res));
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text?.trim()) {
    throw new Error('Empty model response');
  }
  return text;
}

async function completionAnthropic(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorSnippet(res));
  }
  const data = (await res.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const block = data.content?.find((c) => c.type === 'text');
  const text = block?.text;
  if (!text?.trim()) {
    throw new Error('Empty model response');
  }
  return text;
}

async function completionGemini(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const model = 'gemini-1.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    }),
  });
  if (!res.ok) {
    throw new Error(await readErrorSnippet(res));
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
  if (!text?.trim()) {
    throw new Error('Empty model response');
  }
  return text;
}
