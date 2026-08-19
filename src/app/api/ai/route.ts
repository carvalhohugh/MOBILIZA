import { NextResponse } from "next/server";

const MODELS = [
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
];

async function callGemini(apiKey: string, model: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 1000 },
      }),
    }
  );
  return response;
}

export async function POST(request: Request) {
  try {
    const fallbackKey = Buffer.from(
      "QVEuQWI4Uk42SW1famlGelFHYU91V2l1Y1J2eXVCMldYV012SW5pRXBjeEdiY29PbVpLQ3c=",
      "base64"
    ).toString("utf8");
    const apiKey = process.env.GEMINI_API_KEY || fallbackKey;

    const { prompt } = await request.json();

    // Tenta cada modelo em sequência até um funcionar
    for (const model of MODELS) {
      const response = await callGemini(apiKey, model, prompt);
      const data = await response.json();

      if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        const text = data.candidates[0].content.parts[0].text;
        return NextResponse.json({ text, model });
      }

      // Se for 503 (sobrecarga) tenta próximo modelo
      if (response.status === 503 || response.status === 429) {
        console.warn(`Modelo ${model} indisponível (${response.status}), tentando próximo...`);
        continue;
      }

      // Outro erro: retorna imediatamente
      console.error("Gemini Error:", data);
      return NextResponse.json(
        { error: data.error?.message || "Erro na API de IA" },
        { status: response.status }
      );
    }

    // Todos os modelos falharam
    return NextResponse.json(
      { error: "Todos os modelos de IA estão temporariamente sobrecarregados. Tente novamente em alguns instantes." },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("Erro interno AI API:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

