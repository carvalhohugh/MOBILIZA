import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: "Chave da API não configurada. Defina GEMINI_API_KEY no arquivo .env.local" 
      }, { status: 500 });
    }

    const { prompt } = await request.json();

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API Error:", data);
      return NextResponse.json({ error: data.error?.message || "Erro na API de IA" }, { status: response.status });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar a resposta.";

    return NextResponse.json({ text });

  } catch (error: any) {
    console.error("Erro interno AI API:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}
