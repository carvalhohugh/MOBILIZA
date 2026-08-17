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
    <div className="min-h-[80vh] bg-neutral-900 text-white flex flex-col items-center">
      <div className="w-full bg-red-600 p-8 text-center border-b-4 border-yellow-400">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
          MOBILIZA TV
        </h1>
        <p className="text-red-100 text-lg mt-2">
          Acompanhe ao vivo nossas coberturas, sessões e pronunciamentos oficiais.
        </p>
      </div>
      
      <MobilizaTVClient initialSrcUrl={srcUrl} extraVideos={extraVideos || []} />
    </div>
  );
}
