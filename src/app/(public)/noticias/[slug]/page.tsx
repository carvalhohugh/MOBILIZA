import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export const revalidate = 60;

import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: article } = await supabase.from('news').select('*').eq('slug', slug).single();
  
  if (!article) return { title: 'Notícia não encontrada' };

  return {
    title: `${article.title} | MOBILIZA 33`,
    description: article.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
    openGraph: {
      title: article.title,
      description: article.content?.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
      images: article.cover_image ? [{ url: article.cover_image }] : [],
    },
  };
}

export default async function NoticiaDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!article) {
    notFound();
  }

  return (
    <article className="min-h-[80vh] bg-white">
      {/* Header Banner */}
      <div className="w-full bg-neutral-900 text-white p-8 border-b-4 border-red-600">
        <div className="container max-w-4xl mx-auto flex flex-col items-start gap-4">
          <Link href="/noticias" className="inline-flex items-center text-red-400 hover:text-red-300 font-medium transition-colors text-sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para Notícias
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mt-4">
            {article.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-neutral-400 mt-4">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(article.created_at).toLocaleDateString('pt-BR')}
            </span>
            <span className="flex items-center gap-2">
              <User className="w-4 h-4" />
              {article.author || "Equipe"}
            </span>
          </div>
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-12 px-4">
        {article.cover_image && (
          <div className="w-full aspect-video md:aspect-[21/9] bg-neutral-100 rounded-xl overflow-hidden mb-12 shadow-sm border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.cover_image} alt={article.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div 
          className="prose prose-lg md:prose-xl prose-red max-w-none 
          prose-headings:font-bold prose-headings:text-neutral-900
          prose-p:text-neutral-700 prose-p:leading-relaxed
          prose-a:text-red-600 hover:prose-a:text-red-800
          prose-img:rounded-xl prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        {/* RECOMENDAÇÕES DE OUTRAS NOTÍCIAS */}
        <div className="mt-20 pt-10 border-t border-neutral-200">
          <h2 className="text-2xl font-bold mb-6 text-neutral-900">Veja também</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* O componente de servidor vai buscar as notícias extras */}
            <RelatedNews currentSlug={slug} />
          </div>
        </div>
      </div>
    </article>
  );
}

// Subcomponente para buscar as notícias recomendadas
async function RelatedNews({ currentSlug }: { currentSlug: string }) {
  const { data: related } = await supabase
    .from('news')
    .select('id, title, slug, cover_image, created_at')
    .neq('slug', currentSlug)
    .order('created_at', { ascending: false })
    .limit(3);

  if (!related || related.length === 0) {
    return <p className="text-neutral-500">Nenhuma outra notícia disponível no momento.</p>;
  }

  return (
    <>
      {related.map((news) => (
        <Link 
          key={news.id} 
          href={`/noticias/${news.slug}`}
          className="group block border border-neutral-200 rounded-xl overflow-hidden hover:border-red-500 hover:shadow-md transition-all bg-white"
        >
          {news.cover_image ? (
            <div className="w-full h-40 bg-neutral-100 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={news.cover_image} 
                alt={news.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-neutral-100 flex items-center justify-center relative overflow-hidden">
              <span className="text-neutral-400 font-medium">Sem Imagem</span>
            </div>
          )}
          <div className="p-4">
            <p className="text-xs text-neutral-500 mb-2 font-medium">
              {new Date(news.created_at).toLocaleDateString('pt-BR')}
            </p>
            <h3 className="font-bold text-neutral-900 group-hover:text-red-600 transition-colors line-clamp-3">
              {news.title}
            </h3>
          </div>
        </Link>
      ))}
    </>
  );
}
