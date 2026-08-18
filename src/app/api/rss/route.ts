import { NextResponse } from "next/server";
import Parser from "rss-parser";

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded'],
      ['description', 'description']
    ],
  }
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const feedUrl = searchParams.get("url");

  if (!feedUrl) {
    return NextResponse.json({ error: "A URL do feed RSS é obrigatória" }, { status: 400 });
  }

  try {
    const response = await fetch(feedUrl, {
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    let xml = await response.text();
    
    // Sanitize XML (remove BOM, leading whitespace, or invisible chars before <?xml)
    xml = xml.replace(/^\uFEFF/gm, "").trim();
    const startIndex = xml.indexOf('<');
    if (startIndex > 0) {
      xml = xml.substring(startIndex);
    }

    const feed = await parser.parseString(xml);
    
    // Normalizar as postagens para garantir que tenham imagem e resumo
    const items = feed.items.map(item => {
      // Tentar extrair a imagem do media:content, do content:encoded ou description
      let imageUrl = null;
      if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
        imageUrl = item.mediaContent['$'].url;
      } else if (item.contentEncoded) {
        const match = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
        if (match) imageUrl = match[1];
      } else if (item.content) {
        const match = item.content.match(/<img[^>]+src="([^">]+)"/);
        if (match) imageUrl = match[1];
      }

      // Normalizar texto para resumo (remover tags HTML)
      let snippet = item.contentSnippet || item.content || item.description || "";
      snippet = snippet.replace(/<[^>]*>?/gm, '').substring(0, 150) + "...";

      return {
        title: item.title,
        link: item.link,
        pubDate: item.pubDate,
        content: item.contentEncoded || item.content || item.description,
        snippet,
        imageUrl,
        source: feed.title || new URL(feedUrl).hostname
      };
    });

    return NextResponse.json({
      title: feed.title,
      description: feed.description,
      items
    });

  } catch (error: any) {
    console.error("Erro ao fazer parse do RSS:", error);
    return NextResponse.json({ error: "Falha ao processar o feed RSS", details: error.message }, { status: 500 });
  }
}
