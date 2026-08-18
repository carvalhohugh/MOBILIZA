"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Edit3, Image as ImageIcon, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CuradoriaPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Edit Modal State
  const [editingPost, setEditingPost] = useState<any>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImage, setEditImage] = useState("");

  const loadFeeds = async () => {
    setLoading(true);
    setPosts([]);

    // 1. Fetch trusted sites
    const { data: sites } = await supabase.from("trusted_sources").select("*").eq("status", "ATIVO");
    
    if (!sites || sites.length === 0) {
      setLoading(false);
      return;
    }

    const allPosts: any[] = [];
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    // 2. Fetch RSS for each site
    for (const site of sites) {
      try {
        const res = await fetch(`/api/rss?url=${encodeURIComponent(site.rss_url)}`);
        const data = await res.json();
        
        if (data.items) {
          const recentItems = data.items.filter((item: any) => {
            if (!item.pubDate) return true; // keep if no date
            const pDate = new Date(item.pubDate);
            return pDate >= twoWeeksAgo;
          });
          
          allPosts.push(...recentItems);
        }
      } catch (err) {
        console.error(`Erro ao buscar feed de ${site.name}`, err);
      }
    }

    // Sort by date (newest first)
    allPosts.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    setPosts(allPosts);
    setLoading(false);
  };

  useEffect(() => {
    loadFeeds();
  }, []);

  const handlePublish = async (post: any) => {
    setPublishingId(post.link);
    try {
      const slug = post.title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const contentWithCredit = `${post.content}<br><br><p><em>Fonte: <a href="${post.link}" target="_blank" rel="nofollow">${post.source}</a></em></p>`;

      const { error } = await supabase.from('news').insert([{
        title: post.title,
        slug: slug + '-' + Math.floor(Math.random() * 1000),
        content: contentWithCredit,
        cover_image: post.imageUrl || null,
        status: 'PUBLICADO',
        author: 'Curadoria Mobiliza'
      }]);

      if (error) {
        alert("Erro ao publicar: " + error.message);
      } else {
        alert("Notícia publicada com sucesso no portal oficial!");
      }
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao publicar.");
    }
    setPublishingId(null);
  };

  const handleRewriteOpen = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content || post.snippet);
    setEditImage(post.imageUrl || "");
  };

  const handleRewritePublish = async () => {
    setPublishingId("editing");
    try {
      const slug = editTitle.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const contentWithCredit = `${editContent}<br><br><p><em>Adaptação via Curadoria. Fonte original: <a href="${editingPost.link}" target="_blank" rel="nofollow">${editingPost.source}</a></em></p>`;

      const { error } = await supabase.from('news').insert([{
        title: editTitle,
        slug: slug + '-' + Math.floor(Math.random() * 1000),
        content: contentWithCredit,
        cover_image: editImage || null,
        status: 'PUBLICADO',
        author: 'Redação Mobiliza'
      }]);

      if (error) {
        alert("Erro ao publicar: " + error.message);
      } else {
        alert("Notícia reescrita e publicada com sucesso!");
        setEditingPost(null);
      }
    } catch (e) {
      console.error(e);
      alert("Erro inesperado ao publicar.");
    }
    setPublishingId(null);
  };

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  const handleAskAI = async () => {
    setIsGeneratingAI(true);
    try {
      const prompt = `Atue como um jornalista profissional de portal de notícias. Reescreva a seguinte notícia de forma clara, objetiva e atrativa. Mantenha os fatos essenciais.
A resposta DEVE ter estritamente o formato abaixo:
TÍTULO: [O novo título da notícia]
CONTEÚDO: [O texto reescrito formatado em HTML básico com tags <p>, <strong>, etc]

Notícia original:
Título: ${editTitle}
Texto: ${editContent.substring(0, 3000)}`;

      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const text = data.text || '';
      const titleMatch = text.match(/TÍTULO:\s*([^\n]*)/i);
      const contentMatch = text.match(/CONTEÚDO:\s*([\s\S]*)/i);

      if (titleMatch && titleMatch[1]) {
        setEditTitle(titleMatch[1].replace(/\*\*/g, '').trim());
      }
      if (contentMatch && contentMatch[1]) {
        let newContent = contentMatch[1].trim();
        newContent = newContent.replace(/```html/gi, '').replace(/```/g, '').trim();
        setEditContent(newContent);
      } else {
        setEditContent(text.replace(/```html/gi, '').replace(/```/g, '').trim());
      }
    } catch (err: any) {
      console.error(err);
      alert("Erro ao gerar com IA: " + err.message);
    }
    setIsGeneratingAI(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Curadoria de Notícias</h1>
          <p className="text-muted-foreground mt-2">
            Varredura automática dos feeds RSS (últimas 2 semanas). Avalie e publique direto no seu portal.
          </p>
        </div>
        <Button onClick={loadFeeds} disabled={loading} className="mt-4 md:mt-0">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 
          {loading ? 'Varrendo Sites...' : 'Atualizar Varredura'}
        </Button>
      </div>

      {!loading && posts.length === 0 && (
        <Card className="bg-muted/50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma postagem recente encontrada nos sites cadastrados.</p>
            <Button variant="outline" onClick={() => window.location.href = '/admin/configuracoes/sites'}>
              Gerenciar Sites Confiáveis
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, idx) => (
          <Card key={idx} className="flex flex-col overflow-hidden hover:shadow-lg transition-all border-neutral-200">
            {post.imageUrl ? (
              <div className="h-48 w-full bg-neutral-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.imageUrl} alt="" className="object-cover w-full h-full" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {post.source}
                </div>
              </div>
            ) : (
              <div className="h-48 w-full bg-neutral-100 flex flex-col items-center justify-center relative">
                <ImageIcon className="w-12 h-12 text-neutral-300" />
                <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {post.source}
                </div>
              </div>
            )}
            
            <CardHeader className="flex-1 pb-4">
              <div className="text-xs text-muted-foreground mb-2">
                {post.pubDate ? new Date(post.pubDate).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Data Indisponível'}
              </div>
              <CardTitle className="text-lg leading-tight line-clamp-3">
                <a href={post.link} target="_blank" rel="noreferrer" className="hover:text-red-600 transition-colors">
                  {post.title}
                </a>
              </CardTitle>
              <CardDescription className="line-clamp-3 mt-2 text-sm">
                {post.snippet}
              </CardDescription>
            </CardHeader>
            
            <CardFooter className="pt-0 flex gap-2">
              <Button 
                variant="default" 
                className="flex-1 bg-neutral-900 hover:bg-neutral-800"
                disabled={publishingId === post.link}
                onClick={() => handlePublish(post)}
              >
                {publishingId === post.link ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                Republicar
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                disabled={publishingId === post.link}
                onClick={() => handleRewriteOpen(post)}
              >
                <Edit3 className="w-4 h-4 mr-2" />
                Reescrever
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* REWRITE MODAL */}
      <Dialog open={!!editingPost} onOpenChange={(open) => !open && setEditingPost(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reescrever Notícia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-blue-50 text-blue-900 p-4 rounded-md border border-blue-100 mb-2 gap-4">
              <div className="text-sm">
                <strong>IA Integrada:</strong> Você pode usar a Inteligência Artificial para reescrever a notícia inteira instantaneamente num formato mais profissional.
              </div>
              <Button 
                onClick={handleAskAI} 
                disabled={isGeneratingAI}
                className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
              >
                {isGeneratingAI ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                {isGeneratingAI ? 'Reescrevendo...' : 'Reescrever com IA'}
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem</Label>
              <Input value={editImage} onChange={(e) => setEditImage(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Conteúdo (Aceita HTML básico)</Label>
              <textarea 
                className="w-full min-h-[300px] p-3 rounded-md border border-input bg-transparent text-sm shadow-sm"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
              />
            </div>
            <div className="bg-red-50 text-red-900 p-3 rounded-md text-sm">
              <strong>Nota:</strong> O crédito da fonte original será adicionado automaticamente ao final da publicação.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>Cancelar</Button>
            <Button onClick={handleRewritePublish} disabled={publishingId === "editing"} className="bg-red-600 hover:bg-red-700">
              {publishingId === "editing" ? 'Salvando...' : 'Publicar Agora'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
