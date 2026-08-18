import { NextResponse } from 'next/server';

const PMN_CHANNEL_ID = 'UCcOLds6-Mep_wVHct7tKipg';

export const revalidate = 3600; // Cache por 1 hora

export async function GET() {
  try {
    // YouTube RSS feed não precisa de API Key!
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${PMN_CHANNEL_ID}`;
    
    const res = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 }
    });

    if (!res.ok) throw new Error(`YouTube RSS error: ${res.status}`);
    
    const xml = await res.text();
    
    // Parse manual do XML pois não há biblioteca disponível no edge
    const entries: {id: string; title: string; youtube_id: string; thumbnail: string; published: string}[] = [];
    const entryBlocks = xml.split('<entry>').slice(1);
    
    for (const block of entryBlocks) {
      const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
      const titleMatch = block.match(/<title>([^<]+)<\/title>/);
      const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
      
      if (idMatch && titleMatch) {
        const youtubeId = idMatch[1];
        entries.push({
          id: youtubeId,
          youtube_id: youtubeId,
          title: titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
          thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
          published: publishedMatch ? publishedMatch[1] : '',
        });
      }
    }

    return NextResponse.json({ videos: entries, channel_id: PMN_CHANNEL_ID });
  } catch (error) {
    console.error('Error fetching PMN videos:', error);
    return NextResponse.json({ videos: [], error: 'Failed to fetch videos' }, { status: 500 });
  }
}
