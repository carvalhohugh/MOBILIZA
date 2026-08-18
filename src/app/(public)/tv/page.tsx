import { MobilizaTVClient } from "./MobilizaTVClient";

// Canal oficial do PMN - Partido da Mobilização Nacional
const MOBILIZA_CHANNEL_ID = 'UCuuIPv7aRRC3iPZRu24BsxQ';

export const revalidate = 3600;

export default async function MobilizaTVPage() {
  let videos: { id: string; title: string; youtube_id: string; thumbnail: string; published: string; }[] = [];
  
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${MOBILIZA_CHANNEL_ID}`;
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const xml = await res.text();
      const entryBlocks = xml.split('<entry>').slice(1);
      
      for (const block of entryBlocks) {
        const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = block.match(/<media:title>([^<]+)<\/media:title>/) 
                        || block.match(/<title>([^<]+)<\/title>/);
        const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
        
        if (idMatch && titleMatch) {
          const youtubeId = idMatch[1].trim();
          videos.push({
            id: youtubeId,
            youtube_id: youtubeId,
            title: titleMatch[1]
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .trim(),
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
            published: publishedMatch ? publishedMatch[1] : '',
          });
        }
      }
    }
  } catch (e) {
    console.error('Falha ao buscar vídeos do Mobiliza 33:', e);
  }

  // Hero = vídeo mais recente do canal
  const heroVideo = videos.length > 0 ? videos[0] : null;
  const heroSrc = heroVideo
    ? `https://www.youtube.com/embed/${heroVideo.youtube_id}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed/videoseries?list=UU${MOBILIZA_CHANNEL_ID.slice(2)}&rel=0`;

  // Carrossel = todos os vídeos (inclusive o hero, usuário pode re-selecionar)
  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center">
      <MobilizaTVClient initialSrcUrl={heroSrc} extraVideos={videos} />
    </div>
  );
}
