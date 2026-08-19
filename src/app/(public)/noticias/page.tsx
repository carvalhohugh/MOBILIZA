import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Calendar, User, ArrowRight } from "lucide-react";

export const revalidate = 60; // Revalidate every minute

export default async function NoticiasPage() {
  const { data: news } = await supabase
    .from('news')
    .select('*')
    .eq('status', 'PUBLICADO')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-[80vh] bg-neutral-50 flex flex-col items-center">
      <div className="w-full bg-red-600 p-8 text-center border-b-4 border-yellow-400">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-white">
          Notícias e Atualizações
        </h1>
        <p className="text-red-100 text-lg mt-2 max-w-2xl mx-auto">
          Fique por dentro das últimas novidades, ações e coberturas oficiais do partido.
        </p>
      </div>

      <div className="container py-12 px-4 w-full max-w-7xl">
        {(!news || news.length === 0) ? (
          <div className="text-center py-20 text-neutral-500">
            <h2 className="text-2xl font-bold mb-2">Nenhuma notícia publicada ainda.</h2>
            <p>Volte em breve para mais atualizações.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-12">
            {/* MANCHETE DESTAQUE (1ª NOTÍCIA) */}
            <div className="bg-white rounded-2xl shadow-md border border-neutral-200 overflow-hidden flex flex-col lg:flex-row group hover:shadow-lg transition-shadow">
              {news[0].cover_image ? (
                <Link href={`/noticias/${news[0].slug}`} className="w-full lg:w-2/3 h-64 lg:h-[450px] relative overflow-hidden block bg-neutral-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={news[0].cover_image} alt={news[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </Link>
              ) : (
                <div className="w-full lg:w-2/3 h-64 lg:h-[450px] bg-neutral-200 flex items-center justify-center">
                  <span className="text-neutral-400 font-bold uppercase tracking-widest">Sem Imagem</span>
                </div>
              )}
              
              <div className="w-full lg:w-1/3 p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4 font-bold uppercase tracking-wider">
                  <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full">Destaque</span>
                  <span>{new Date(news[0].created_at).toLocaleDateString('pt-BR')}</span>
                </div>

                <Link href={`/noticias/${news[0].slug}`}>
                  <h2 className="text-3xl md:text-4xl font-extrabold text-neutral-900 mb-4 leading-tight group-hover:text-red-600 transition-colors">
                    {news[0].title}
                  </h2>
                </Link>
                
                <p className="text-neutral-600 line-clamp-4 mb-8 text-lg"
                   dangerouslySetInnerHTML={{ __html: news[0].content.replace(/<[^>]*>?/gm, '').substring(0, 250) + "..." }}
                />

                <Link 
                  href={`/noticias/${news[0].slug}`}
                  className="inline-flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded-full font-bold hover:bg-neutral-900 transition-colors mt-auto w-fit shadow-md"
                >
                  Ler matéria completa <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* GRID DAS DEMAIS NOTÍCIAS */}
            {news.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {news.slice(1).map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-neutral-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                    {item.cover_image ? (
                      <Link href={`/noticias/${item.slug}`} className="h-52 w-full bg-neutral-100 overflow-hidden relative block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.cover_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </Link>
                    ) : (
                      <div className="h-52 w-full bg-neutral-100 flex items-center justify-center">
                        <span className="text-neutral-400 text-sm font-bold uppercase">Sem Imagem</span>
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-4 text-xs text-neutral-500 mb-3 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(item.created_at).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.author || "Equipe"}
                        </span>
                      </div>

                      <Link href={`/noticias/${item.slug}`}>
                        <h3 className="text-xl font-bold text-neutral-900 mb-3 line-clamp-3 leading-snug group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                      </Link>
                      
                      <p className="text-neutral-600 line-clamp-2 mb-6 text-sm flex-1"
                         dangerouslySetInnerHTML={{ __html: item.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + "..." }}
                      />

                      <Link 
                        href={`/noticias/${item.slug}`}
                        className="inline-flex items-center text-red-600 font-bold hover:text-red-700 transition-colors mt-auto w-fit"
                      >
                        Ler matéria <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
