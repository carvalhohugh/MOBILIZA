import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let siteUrl = searchParams.get("url");

  if (!siteUrl) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  if (!siteUrl.startsWith('http')) {
    siteUrl = 'https://' + siteUrl;
  }

  try {
    const response = await fetch(siteUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    
    const contentType = response.headers.get("content-type") || "";
    // Se a URL original JÁ for um XML/RSS, retornamos ela mesma
    if (contentType.includes("xml") || contentType.includes("rss")) {
      return NextResponse.json({ rssUrl: siteUrl });
    }

    const html = await response.text();
    
    // Tentar encontrar a tag <link rel="alternate" type="application/rss+xml" href="...">
    const linkRegex = /<link[^>]+(?:type=["']application\/(rss|atom)\+xml["'][^>]+href=["']([^"']+)["']|href=["']([^"']+)["'][^>]+type=["']application\/(rss|atom)\+xml["'])[^>]*>/i;
    
    const match = html.match(linkRegex);
    
    let discoveredUrl = siteUrl;

    if (match) {
      let href = match[2] || match[3];
      if (href) {
        if (href.startsWith('/')) {
          const urlObj = new URL(siteUrl);
          discoveredUrl = urlObj.origin + href;
        } else if (!href.startsWith('http')) {
          const urlObj = new URL(siteUrl);
          discoveredUrl = urlObj.origin + '/' + href;
        } else {
          discoveredUrl = href;
        }
        return NextResponse.json({ rssUrl: discoveredUrl });
      }
    }

    // Regras amigáveis para sites comuns
    if (siteUrl.includes('globo.com')) return NextResponse.json({ rssUrl: 'https://g1.globo.com/rss/g1/politica/' });
    if (siteUrl.includes('senado.leg.br')) return NextResponse.json({ rssUrl: 'https://www12.senado.leg.br/noticias/rss' });
    if (siteUrl.includes('camara.leg.br')) return NextResponse.json({ rssUrl: 'https://www.camara.leg.br/noticias/rss' });
    if (siteUrl.includes('stf.jus.br')) return NextResponse.json({ rssUrl: 'https://portal.stf.jus.br/noticias/rss' });
    if (siteUrl.includes('tse.jus.br')) return NextResponse.json({ rssUrl: 'https://www.tse.jus.br/rss' });
    
    // Fallback: se não achar nada
    return NextResponse.json({ rssUrl: siteUrl });

  } catch (error: any) {
    return NextResponse.json({ rssUrl: siteUrl }); // Em caso de erro, retorna o original
  }
}
