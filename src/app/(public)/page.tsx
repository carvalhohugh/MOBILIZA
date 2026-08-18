import { Button } from "@/components/ui/button";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Calendar, User } from "lucide-react";

export const revalidate = 60; 

export default async function Home() {
  const [newsRes, bannersRes] = await Promise.all([
    supabase.from('news').select('*').eq('status', 'PUBLICADO').order('published_at', { ascending: false }).limit(3),
    supabase.from('banners').select('*').eq('is_active', true).order('order_index', { ascending: true })
  ]);

  const news = newsRes.data || [];
  const banners = bannersRes.data || [];
  
  // Default fallback banner if none are registered
  const mainBanner = banners.length > 0 ? banners[0] : {
    image_url: "https://images.unsplash.com/photo-1575320295849-0fbfb1c97f1f?q=80&w=2000&auto=format&fit=crop",
    title: "O BRASIL EM MOVIMENTO",
    subtitle: "Conheça as diretrizes, a força de nossos representantes e o compromisso do MOBILIZA 33 com o futuro da nação.",
    link_url: "/filie-se"
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION / DESTAQUE PRINCIPAL */}
      <section className="relative w-full h-[80vh] bg-neutral-900 flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-60 bg-cover bg-center transition-all duration-1000"
          style={{ backgroundImage: `url('${mainBanner.image_url}')` }} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-red-900/40 to-transparent z-0" />
        
        <div className="container relative z-10 text-white space-y-6">
          <span className="bg-red-600 text-white text-sm font-bold uppercase px-3 py-1 rounded inline-block shadow-lg border border-red-500">Destaque</span>
          
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter max-w-4xl leading-[0.9] text-white drop-shadow-2xl">
            {mainBanner.title}
          </h1>
          
          <p className="text-xl md:text-3xl text-neutral-200 max-w-2xl font-medium drop-shadow-md">
            {mainBanner.subtitle}
          </p>
          
          <div className="pt-8 flex flex-col sm:flex-row gap-6">
            <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white px-10 py-8 text-xl font-black uppercase rounded-full shadow-2xl border-4 border-red-500/30" asChild>
              <Link href={mainBanner.link_url || "/filie-se"}>Saiba Mais</Link>
            </Button>
            <Button size="lg" className="px-10 py-8 text-xl font-bold uppercase text-white bg-transparent border-2 border-white hover:bg-white hover:text-red-600 rounded-full backdrop-blur-sm transition-all" asChild>
              <Link href="/institucional">Nosso Manifesto</Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* SEÇÃO DE NOTÍCIAS */}
      <section className="py-20 bg-neutral-100">
        <div className="container">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-4xl font-extrabold uppercase text-neutral-900 tracking-tight border-l-8 border-red-600 pl-4">
                Últimas Notícias
              </h2>
              <p className="text-neutral-500 mt-2 font-medium">Fique por dentro das ações do partido</p>
            </div>
            <Button variant="link" className="text-red-600 font-bold uppercase hidden md:flex" asChild>
              <Link href="/noticias">Ver todas as notícias &rarr;</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news && news.length > 0 ? (
              news.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all border border-neutral-200">
                  <div className="aspect-video relative overflow-hidden bg-neutral-200">
                    {item.cover_image ? (
                      <div 
                        className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                        style={{ backgroundImage: `url(${item.cover_image})` }} 
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-neutral-400">Sem Imagem</div>
                    )}
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-red-600 font-bold uppercase mb-2">
                      {new Date(item.published_at).toLocaleDateString('pt-BR')}
                    </p>
                    <h3 className="text-xl font-bold text-neutral-900 leading-tight group-hover:text-red-600 transition-colors mb-4 line-clamp-3">
                      {item.title}
                    </h3>
                    <Button variant="outline" className="w-full uppercase font-bold text-neutral-900 border-neutral-300 hover:bg-red-600 hover:border-red-600 hover:text-white" asChild>
                      <Link href={`/noticias/${item.slug}`}>Leia Mais</Link>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-neutral-500 col-span-3 text-center py-10 bg-white rounded-lg border">Nenhuma notícia publicada ainda.</p>
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" className="uppercase font-bold" asChild>
              <Link href="/noticias">Ver todas as notícias</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* SEÇÃO PROGRAMAS E DESTAQUES (Estilo PL Mulher/Jovem) */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-extrabold uppercase text-neutral-900 tracking-tight border-l-8 border-neutral-900 pl-4 mb-12 text-center md:text-left">
            Nossos Programas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link href="/programas/mulher" className="group block relative overflow-hidden rounded-2xl shadow-xl h-80">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Mobiliza Mulher</h3>
                <p className="text-white/90 font-medium">Fortalecendo a liderança feminina na política nacional.</p>
                <div className="mt-4 bg-red-600 text-white font-bold uppercase text-xs inline-block px-4 py-2 rounded">Conheça</div>
              </div>
            </Link>

            <Link href="/programas/jovem" className="group block relative overflow-hidden rounded-2xl shadow-xl h-80">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1529390079861-591de354faf5?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 w-full">
                <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2">Mobiliza Jovem</h3>
                <p className="text-white/90 font-medium">A nova geração construindo o futuro do Brasil.</p>
                <div className="mt-4 bg-neutral-900 text-white font-bold uppercase text-xs inline-block px-4 py-2 rounded">Conheça</div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION FINAL */}
      <section className="bg-red-600 py-16 text-center px-4 flex flex-col items-center">
        <div className="container max-w-3xl flex flex-col items-center space-y-6">
          <h2 className="text-4xl font-extrabold text-white uppercase tracking-tight text-center">O Brasil não pode esperar.</h2>
          <p className="text-xl text-red-100 font-medium text-center">
            Junte-se ao Mobiliza 33 e seja parte da transformação que o país precisa.
          </p>
          <div className="pt-4 flex justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-neutral-100 px-12 py-8 text-xl font-bold uppercase rounded-full shadow-xl" asChild>
              <Link href="/filie-se">Filie-se Agora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Espaço Cinza solicitado pelo usuário */}
      <div className="w-full h-24 bg-neutral-100"></div>
    </div>
  );
}
