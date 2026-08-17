"use client";

import { useState } from "react";
import { PlaySquare } from "lucide-react";

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
  const [currentSrc, setCurrentSrc] = useState(initialSrcUrl);

  const handleVideoClick = (youtubeId: string) => {
    setCurrentSrc(`https://www.youtube.com/embed/${youtubeId}?autoplay=1`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container py-12 flex flex-col items-center w-full max-w-5xl">
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border-4 border-neutral-800">
        <iframe 
          width="100%" 
          height="100%" 
          src={currentSrc} 
          title="MOBILIZA TV - Transmissão Oficial" 
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerPolicy="strict-origin-when-cross-origin" 
          allowFullScreen>
        </iframe>
      </div>
      <p className="text-neutral-400 mt-6 text-center max-w-2xl">
        Os vídeos reproduzidos nesta página são gerenciados pelo painel de configurações oficial do MOBILIZA 33, puxando de nossos canais verificados no YouTube.
      </p>

      {extraVideos.length > 0 && (
        <div className="w-full mt-16">
          <h2 className="text-2xl font-bold uppercase border-b border-neutral-800 pb-2 mb-6">Mais Vídeos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {extraVideos.map(video => (
              <div 
                key={video.id} 
                className="group cursor-pointer flex flex-col gap-2"
                onClick={() => handleVideoClick(video.youtube_id)}
              >
                <div className="aspect-video bg-neutral-800 rounded-lg overflow-hidden relative flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://img.youtube.com/vi/${video.youtube_id}/mqdefault.jpg`} 
                    alt={video.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                  <PlaySquare className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all z-10 drop-shadow-md" />
                </div>
                <h3 className="font-semibold text-neutral-200 group-hover:text-red-400 transition-colors line-clamp-2">
                  {video.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
