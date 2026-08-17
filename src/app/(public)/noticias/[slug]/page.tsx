import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User } from "lucide-react";

export const revalidate = 60;

export default async function NoticiaDetalhePage({ params }: { params: { slug: string } }) {
  const { data: article } = await supabase
    .from('news')
    .select('*')
    .eq('slug', params.slug)
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
      </div>
    </article>
  );
}
