import { MobilizaTVClient } from "./MobilizaTVClient";

const PMN_CHANNEL_ID = 'UCcOLds6-Mep_wVHct7tKipg';

export const revalidate = 3600;

export default async function MobilizaTVPage() {
  // Busca vídeos reais do canal do PMN via RSS (sem API Key!)
  let pmnVideos: { id: string; title: string; youtube_id: string; thumbnail: string; published: string; }[] = [];
  
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${PMN_CHANNEL_ID}`;
    const res = await fetch(rssUrl, { next: { revalidate: 3600 } });
    
    if (res.ok) {
      const xml = await res.text();
      const entryBlocks = xml.split('<entry>').slice(1);
      
      for (const block of entryBlocks) {
        const idMatch = block.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
        const titleMatch = block.match(/<title>([^<]+)<\/title>/);
        const publishedMatch = block.match(/<published>([^<]+)<\/published>/);
        
        if (idMatch && titleMatch) {
          const youtubeId = idMatch[1];
          pmnVideos.push({
            id: youtubeId,
            youtube_id: youtubeId,
            title: titleMatch[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'"),
            thumbnail: `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`,
            published: publishedMatch ? publishedMatch[1] : '',
          });
        }
      }
    }
  } catch (e) {
    console.error('Falha ao buscar vídeos do PMN:', e);
  }

  // Vídeo principal = o mais recente do canal
  const mainVideoId = pmnVideos.length > 0 ? pmnVideos[0].youtube_id : null;
  const mainSrcUrl = mainVideoId
    ? `https://www.youtube.com/embed/${mainVideoId}?autoplay=1&rel=0`
    : `https://www.youtube.com/embed/videoseries?list=UUcOLds6-Mep_wVHct7tKipg&rel=0`;

  // Vídeos do carrossel = restantes (excluindo o primeiro que já está no hero)
  const carouselVideos = pmnVideos.slice(1);

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center">
      <MobilizaTVClient initialSrcUrl={mainSrcUrl} extraVideos={carouselVideos} />
    </div>
  );
}

