"use client";

import { useState } from "react";
import { Play, Info, Volume2, VolumeX } from "lucide-react";

interface Video {
  id: string;
  title: string;
  youtube_id: string;
}

export function MobilizaTVClient({ 
  initialSrcUrl, 
  extraVideos 
}: { 
  initialSrcUrl: string; 
  extraVideos: Video[];
}) {
  // Se o usuário ainda não cadastrou vídeos no banco, usar vídeos fictícios do canal para preencher
  const displayVideos = extraVideos.length > 0 ? extraVideos : [
    { id: '1', title: 'O Futuro do Brasil em Nossas Mãos', youtube_id: 'UUz0i9BsZhhxGuPAUjQ77XCw' },
    { id: '2', title: 'Nossas Diretrizes e Valores', youtube_id: 'dQw4w9WgXcQ' },
    { id: '3', title: 'Convenção Nacional 2026', youtube_id: 'jNQXAC9IVRw' },
    { id: '4', title: 'Entrevista Exclusiva', youtube_id: '9bZkp7q19f0' },
    { id: '5', title: 'A Força do Povo', youtube_id: 'V-_O7nl0Ii0' }
  ];

  const [currentSrc, setCurrentSrc] = useState(initialSrcUrl);

  const handleVideoClick = (youtubeId: string) => {
    setCurrentSrc(`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex flex-col pb-20">
      
      {/* HERO / DESTAQUE (Netflix Style) */}
      <div className="relative w-full h-[60vh] md:h-[80vh] bg-black">
        {/* Iframe for Hero Video */}
        <div className="absolute inset-0 w-full h-full pointer-events-auto">
          <iframe 
            className="w-full h-full object-cover"
            src={`${currentSrc}${currentSrc.includes('?') ? '&' : '?'}controls=1&autoplay=1&mute=0&rel=0`} 
            title="MOBILIZA TV" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin" 
            allowFullScreen
          />
        </div>

        {/* Gradientes Netflix - Fade to black at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/20 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/80 via-transparent to-transparent pointer-events-none" />

        {/* Informações sobrepostas (Opcional, caso queiramos botões por cima) */}
        <div className="absolute bottom-[10%] left-[4%] md:left-[5%] z-10 w-full max-w-2xl pointer-events-none">
          <h1 className="text-4xl md:text-6xl font-black text-white drop-shadow-lg uppercase tracking-tight leading-tight mb-4">
            Mobiliza TV
          </h1>
          <p className="text-white/80 text-lg md:text-xl drop-shadow-md font-medium max-w-xl mb-6 line-clamp-3">
            Acompanhe nossas transmissões, sessões ao vivo e todos os pronunciamentos oficiais diretamente do seu dispositivo. O Brasil em movimento.
          </p>
        </div>
      </div>

      {/* CARROSSEL DE VÍDEOS (Estilo Netflix) */}
      {displayVideos.length > 0 && (
        <div className="w-full -mt-16 md:-mt-32 relative z-20 px-[4%] md:px-[5%]">
          <h2 className="text-2xl font-bold text-white mb-4 drop-shadow-md">Últimos Lançamentos</h2>
          
          <div className="flex gap-4 overflow-x-auto pb-8 pt-2 hide-scrollbar snap-x scroll-smooth">
            {displayVideos.map((video) => (
              <div 
                key={video.id} 
                onClick={() => handleVideoClick(video.youtube_id)}
                className="group relative flex-none w-[280px] md:w-[320px] aspect-video rounded-md bg-zinc-800 overflow-hidden cursor-pointer snap-start transition-all duration-300 hover:scale-105 hover:z-30 shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                  alt={video.title}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                />
                
                {/* Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button className="bg-white text-black rounded-full p-2 hover:bg-neutral-300 transition">
                      <Play className="w-4 h-4 fill-black" />
                    </button>
                    <button className="border-2 border-white/50 rounded-full p-2 hover:border-white transition">
                      <Info className="w-4 h-4 text-white" />
                    </button>
                  </div>
                  <h3 className="font-bold text-white text-sm line-clamp-2 leading-tight">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 text-xs font-semibold">
                    <span className="text-green-500">Relevante</span>
                    <span className="border border-neutral-500 text-neutral-300 px-1 rounded">Livre</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Adiciona estilo para esconder o scrollbar nativo mas manter a funcionalidade */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
}
