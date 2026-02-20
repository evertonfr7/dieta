/**
 * Estimativa de macros via Google Gemini.
 */

const SYSTEM_PROMPT = `Você é um nutricionista. Para a descrição de comida fornecida, responda com UM ÚNICO bloco: um objeto JSON válido, sem nenhuma frase antes ou depois. Não escreva "Here is the JSON" nem qualquer texto introdutório.

Formato obrigatório do JSON (use exatamente estas chaves):
{"calorias": número, "proteinas": número, "carboidratos": número, "gorduras": número, "porcao": "string"}

Exemplo de resposta válida:
{"calorias": 350, "proteinas": 25, "carboidratos": 40, "gorduras": 10, "porcao": "1 prato médio"}

Seja realista nos valores. Retorne só o JSON, começando com { e terminando com }.`;

const MODEL = 'gemini-2.5-flash';

function parseRetryDelaySeconds(errBody: string): number {
  try {
    const parsed = JSON.parse(errBody);
    const retryInfo = parsed?.error?.details?.find(
      (d: { '@type'?: string; retryDelay?: string }) =>
        d['@type']?.includes('RetryInfo') && d.retryDelay
    );
    if (retryInfo?.retryDelay) {
      const match = String(retryInfo.retryDelay).match(/(\d+)/);
      return match ? Math.min(Number(match[1]), 60) : 30;
    }
  } catch {
    // ignore
  }
  return 30;
}

export async function estimateMacrosWithAI(descricao: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY não configurada. Defina em .env.local — chave grátis em https://aistudio.google.com/apikey'
    );
  }

  const userMessage = `Estime os valores nutricionais para: ${descricao}\n\nResponda somente com o objeto JSON, sem nenhum texto antes ou depois.`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
  // Sem responseMimeType para evitar resposta truncada em duas partes (intro + JSON)
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [{ parts: [{ text: userMessage }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 500,
    },
  });

  const maxRetries = 2;
  let lastError: string = '';

  async function doRequest(requestBody: string): Promise<string> {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    });
    if (!res.ok) {
      const errBody = await res.text();
      if (res.status === 429) {
        const waitSec = parseRetryDelaySeconds(errBody);
        await new Promise((r) => setTimeout(r, waitSec * 1000));
        return doRequest(requestBody);
      }
      throw new Error(`Gemini: ${res.status} ${errBody}`);
    }
    const data = await res.json();
    const parts = data.candidates?.[0]?.content?.parts ?? [];
    const allText = parts
      .map((p: { text?: string }) => p?.text ?? '')
      .filter(Boolean)
      .join('\n')
      .trim();
    if (!allText) throw new Error('Resposta vazia do Gemini');
    if (allText.includes('{')) return allText;
    const jsonPart = parts.find((p: { text?: string }) => (p?.text ?? '').includes('{'));
    return jsonPart?.text?.trim() ?? allText;
  }

  let text = await doRequest(body);
  if (text.includes('{')) return text;

  // Segunda tentativa: uma única mensagem, sem system instruction
  const fallbackBody = JSON.stringify({
    contents: [{
      parts: [{
        text: `Para esta comida, retorne APENAS um JSON com: calorias, proteinas, carboidratos, gorduras (números), porcao (string). Nada mais.\nComida: ${descricao}`,
      }],
    }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 500 },
  });
  try {
    text = await doRequest(fallbackBody);
  } catch {
    throw new Error('Gemini não retornou JSON. Tente novamente em alguns segundos.');
  }
  if (text.includes('{')) return text;

  throw new Error(
    'Gemini não retornou JSON. Resposta: ' + (text?.slice(0, 150) || 'vazia')
  );
}
