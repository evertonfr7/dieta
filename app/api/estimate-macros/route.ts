import { NextRequest, NextResponse } from 'next/server';
import { MacroNutrientes } from '@/types';
import { estimateMacrosWithAI } from '@/lib/ai-providers';

function extractJsonObject(s: string): string | null {
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  let quote = '';
  for (let i = start; i < s.length; i++) {
    const c = s[i];
    if (escape) {
      escape = false;
      continue;
    }
    if (inString) {
      if (c === '\\') escape = true;
      else if (c === quote) inString = false;
      continue;
    }
    if (c === '"' || c === "'") {
      inString = true;
      quote = c;
      continue;
    }
    if (c === '{') depth++;
    if (c === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  return null;
}

/** Repara JSON truncado (ex.: termina em "proteinas": sem valor nem }) */
function repairTruncatedJson(s: string): string {
  let t = s.trim();
  if (!t.startsWith('{')) return s;
  // Chave sem valor no final (ex.: "proteinas": ou "proteinas": )
  if (/:\s*$/.test(t)) t += '0';
  if (/["']\s*$/.test(t)) t += '"}';
  const open = (t.match(/{/g) || []).length;
  const close = (t.match(/}/g) || []).length;
  let needed = open - close;
  if (needed > 0) {
    if (!t.endsWith('}')) {
      if (!t.endsWith(',') && !t.endsWith('{')) t += ',';
      t += ' "carboidratos":0, "gorduras":0, "porcao":"1 porção"';
    }
    while (needed--) t += '}';
  }
  return t;
}

function parseMacrosFromResponse(content: string): MacroNutrientes & { porcao: string } {
  const raw = content.trim();

  // Conteúdo após ```json (com ou sem ``` de fechamento)
  const jsonBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*)/);
  const block = jsonBlockMatch
    ? (jsonBlockMatch[1] ?? raw).trim().replace(/\s*```\s*$/, '')
    : raw;

  let obj = extractJsonObject(block);
  if (obj) return JSON.parse(obj) as MacroNutrientes & { porcao: string };

  // Bloco começa com { mas está truncado (ex.: "proteinas": sem valor)
  if (block.startsWith('{')) {
    try {
      const repaired = repairTruncatedJson(block);
      const parsed = JSON.parse(repaired) as MacroNutrientes & { porcao?: string };
      return {
        calorias: Number(parsed.calorias) || 0,
        proteinas: Number(parsed.proteinas) || 0,
        carboidratos: Number(parsed.carboidratos) || 0,
        gorduras: Number(parsed.gorduras) || 0,
        porcao: String(parsed.porcao ?? '1 porção'),
      };
    } catch {
      // fallthrough para erro abaixo
    }
  }

  obj = extractJsonObject(raw);
  if (obj) return JSON.parse(obj) as MacroNutrientes & { porcao: string };

  throw new Error('Resposta da IA não contém JSON válido: ' + raw.slice(0, 100));
}

export async function POST(request: NextRequest) {
  try {
    const { descricao } = await request.json();

    if (!descricao || typeof descricao !== 'string') {
      return NextResponse.json(
        { error: 'Descrição é obrigatória' },
        { status: 400 }
      );
    }

    const content = await estimateMacrosWithAI(descricao);
    const macros = parseMacrosFromResponse(content);

    return NextResponse.json({
      macros: {
        calorias: Math.round(macros.calorias),
        proteinas: Math.round(macros.proteinas * 10) / 10,
        carboidratos: Math.round(macros.carboidratos * 10) / 10,
        gorduras: Math.round(macros.gorduras * 10) / 10,
      },
      porcao: macros.porcao || '1 porção',
    });
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    const message = error instanceof Error ? error.message : 'Erro ao processar requisição';
    const status = message.includes('Nenhuma API key') ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
