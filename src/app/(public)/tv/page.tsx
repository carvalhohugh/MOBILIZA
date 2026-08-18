import { supabase } from "@/lib/supabase";
import { MobilizaTVClient } from "./MobilizaTVClient";

export default async function MobilizaTVPage() {
  // Puxa a playlist/vídeo principal
  const { data } = await supabase.from('settings').select('value').eq('key', 'mobiliza_tv_playlist').single();
  const videoIdOrPlaylist = data?.value || "UUz0i9BsZhhxGuPAUjQ77XCw";
  
  const isPlaylist = videoIdOrPlaylist.startsWith('PL') || videoIdOrPlaylist.startsWith('UU');
  const srcUrl = isPlaylist 
    ? `https://www.youtube.com/embed/videoseries?list=${videoIdOrPlaylist}`
    : `https://www.youtube.com/embed/${videoIdOrPlaylist}`;

  // Puxa vídeos secundários
  const { data: extraVideos } = await supabase
    .from('mobiliza_tv_videos')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#141414] text-white flex flex-col items-center">
      <MobilizaTVClient initialSrcUrl={srcUrl} extraVideos={extraVideos || []} />
    </div>
  );
}
