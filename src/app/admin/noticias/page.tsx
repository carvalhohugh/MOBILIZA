"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NoticiasPage() {
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [author, setAuthor] = useState("");
  
  // AI Modal State
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiSource, setAiSource] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    const { data } = await supabase.from('news').select('*').order('created_at', { ascending: false });
    if (data) setNews(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const slug = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const { error } = await supabase.from('news').insert([
      { title, slug, content, cover_image: coverImage, author }
    ]);

    if (!error) {
      alert("Notícia publicada com sucesso!");
      setTitle(""); setContent(""); setCoverImage(""); setAuthor("");
      fetchNews();
    } else {
      alert("Erro ao publicar: " + error.message);
    }
  }

  function handleAiGenerate() {
    if (!aiSource) return alert("Informe um tema ou link de referência.");
    setIsGenerating(true);
    
    // Simulação do comportamento da IA puxando de fontes cadastradas
    setTimeout(() => {
      setTitle("Novo Cenário Político: Avanços do MOBILIZA 33");
      setContent(`Com base nas análises recentes e nas informações apuradas de fontes confiáveis, o partido MOBILIZA 33 apresenta um crescimento expressivo em todo o território nacional.\n\nNossas lideranças estão trabalhando para construir um plano de governo sólido e participativo, com foco no desenvolvimento econômico e na justiça social.\n\n(Texto gerado pela I.A. baseado em: ${aiSource})`);
      setCoverImage("https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=1000&auto=format&fit=crop");
      setAuthor("Equipe de Comunicação");
      setIsGenerating(false);
      setIsAiModalOpen(false);
    }, 2000);
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog & Notícias</h1>
          <p className="text-muted-foreground">Gerencie as publicações do site oficial.</p>
        </div>
      </div>

      <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
        {/* Formulário de Nova Publicação (Estilo WP) */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Nova Publicação</CardTitle>
            <Button variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100" onClick={() => setIsAiModalOpen(true)}>
              ✨ Gerar com I.A.
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Notícia</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ex: Mobiliza 33 lança nova campanha..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover">URL da Imagem de Capa (Destaque)</Label>
                <Input id="cover" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} placeholder="https://..." />
                {coverImage && (
                  <div className="mt-2 h-40 w-full rounded-md bg-cover bg-center border" style={{ backgroundImage: `url(${coverImage})` }} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Conteúdo (Texto)</Label>
                <Textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} required className="min-h-[300px]" placeholder="Escreva o corpo da notícia aqui..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Autor (Opcional)</Label>
                <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Nome do autor ou departamento" />
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold">
                Publicar Notícia
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Publicações Recentes */}
        <Card className="md:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Publicadas Recentemente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {news.map(item => (
              <div key={item.id} className="flex gap-4 items-center border-b pb-4">
                {item.cover_image ? (
                  <div className="h-16 w-16 bg-cover bg-center rounded bg-neutral-200 shrink-0" style={{ backgroundImage: `url(${item.cover_image})` }} />
                ) : (
                  <div className="h-16 w-16 bg-neutral-100 rounded shrink-0 flex items-center justify-center text-xs text-neutral-400">Sem Capa</div>
                )}
                <div>
                  <h4 className="font-semibold text-sm line-clamp-2">{item.title}</h4>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(item.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
            {news.length === 0 && <p className="text-sm text-neutral-500">Nenhuma notícia publicada ainda.</p>}
          </CardContent>
        </Card>
      </div>

      {/* MODAL DA INTELIGÊNCIA ARTIFICIAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-lg">
            <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
              ✨ Redator I.A.
            </h2>
            <p className="text-neutral-600 mb-6 text-sm">
              Nossa I.A. está conectada a portais de notícias confiáveis (G1, CNN, Metrópoles). Digite o link da fonte original ou o tema desejado para reescrevermos no tom do partido.
            </p>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Link de Referência ou Tema Central</Label>
                <Input 
                  value={aiSource} 
                  onChange={(e) => setAiSource(e.target.value)} 
                  placeholder="Ex: https://g1.globo.com/politica/..." 
                />
              </div>
              
              <div className="flex gap-4 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setIsAiModalOpen(false)}>
                  Cancelar
                </Button>
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white" onClick={handleAiGenerate} disabled={isGenerating}>
                  {isGenerating ? "Processando e Escrevendo..." : "Gerar Rascunho"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
