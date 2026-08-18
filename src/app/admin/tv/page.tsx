"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, PlaySquare } from "lucide-react";

export default function AdminTVPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const loadVideos = async () => {
    setLoading(true);
    const { data } = await supabase.from("mobiliza_tv_videos").select("*").order("created_at", { ascending: false });
    if (data) setVideos(data);
    setLoading(false);
  };

  useEffect(() => {
    loadVideos();
  }, []);

  const extractYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle || !newUrl) return;

    const ytId = extractYouTubeId(newUrl);
    if (!ytId) {
      alert("URL do YouTube inválida.");
      return;
    }
    
    const { error } = await supabase.from("mobiliza_tv_videos").insert([{ 
      title: newTitle, 
      youtube_id: ytId 
    }]);

    if (error) {
      alert("Erro ao salvar vídeo: " + error.message);
      return;
    }

    setNewTitle("");
    setNewUrl("");
    loadVideos();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este vídeo da TV?")) {
      await supabase.from("mobiliza_tv_videos").delete().eq("id", id);
      loadVideos();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mobiliza TV - Vídeos Secundários</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os vídeos que aparecerão logo abaixo do reprodutor principal da Mobiliza TV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Vídeo</CardTitle>
          <CardDescription>Insira o título e a URL do vídeo do YouTube.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Título do Vídeo</label>
              <Input placeholder="Ex: Sessão Plenária 24/05" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
            </div>
            <div className="space-y-2 flex-[2]">
              <label className="text-sm font-medium">Link do YouTube</label>
              <Input placeholder="Ex: https://www.youtube.com/watch?v=XXXXXXX" value={newUrl} onChange={e => setNewUrl(e.target.value)} required type="url" />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Vídeos Cadastrados</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={loadVideos}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Preview</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Video ID</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map(v => (
                <TableRow key={v.id}>
                  <TableCell>
                    <div className="w-12 h-8 bg-neutral-100 rounded overflow-hidden relative flex items-center justify-center">
                      <img src={`https://img.youtube.com/vi/${v.youtube_id}/default.jpg`} className="object-cover absolute inset-0 w-full h-full" alt="thumb" />
                      <PlaySquare className="w-4 h-4 text-white z-10" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{v.title}</TableCell>
                  <TableCell className="text-muted-foreground">{v.youtube_id}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {videos.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    Nenhum vídeo extra cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
