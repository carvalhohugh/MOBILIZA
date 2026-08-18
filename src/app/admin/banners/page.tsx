"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newTitle, setNewTitle] = useState("");
  const [newSubtitle, setNewSubtitle] = useState("");
  const [newImageUrl, setNewImageUrl] = useState("");
  const [newLinkUrl, setNewLinkUrl] = useState("");

  const loadBanners = async () => {
    setLoading(true);
    const { data } = await supabase.from("banners").select("*").order("order_index", { ascending: true });
    if (data) setBanners(data);
    setLoading(false);
  };

  useEffect(() => {
    loadBanners();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTitle || !newImageUrl) return;

    const { error } = await supabase.from("banners").insert([{ 
      title: newTitle, 
      subtitle: newSubtitle,
      image_url: newImageUrl,
      link_url: newLinkUrl,
      order_index: banners.length
    }]);

    if (error) {
      alert("Erro ao salvar banner: " + error.message);
      return;
    }

    setNewTitle("");
    setNewSubtitle("");
    setNewImageUrl("");
    setNewLinkUrl("");
    loadBanners();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este banner?")) {
      await supabase.from("banners").delete().eq("id", id);
      loadBanners();
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await supabase.from("banners").update({ is_active: !current }).eq("id", id);
    loadBanners();
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Banners</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie os destaques (carrossel) da página inicial.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Banner</CardTitle>
          <CardDescription>A imagem deve ter alta resolução (ideal 1920x1080).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Título (Obrigatório)</label>
                <Input placeholder="Ex: Mobiliza 33 Cresce" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              </div>
              <div className="space-y-2 flex-[2]">
                <label className="text-sm font-medium">URL da Imagem (Obrigatória)</label>
                <Input placeholder="https://..." value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} required type="url" />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Subtítulo (Opcional)</label>
                <Input placeholder="Breve chamada..." value={newSubtitle} onChange={e => setNewSubtitle(e.target.value)} />
              </div>
              <div className="space-y-2 flex-[2]">
                <label className="text-sm font-medium">Link de Destino (Opcional)</label>
                <Input placeholder="Para onde o botão vai redirecionar?" value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} type="url" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar Banner
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Banners Cadastrados</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={loadBanners}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Imagem</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Visível</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {banners.map(b => (
                <TableRow key={b.id}>
                  <TableCell>
                    <div className="w-16 h-10 bg-neutral-100 rounded overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.image_url} className="object-cover w-full h-full" alt="thumb" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {b.title}
                    {b.subtitle && <span className="block text-xs text-muted-foreground">{b.subtitle}</span>}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground truncate max-w-[200px]">{b.link_url || "-"}</TableCell>
                  <TableCell>
                    <Switch checked={b.is_active} onCheckedChange={() => handleToggle(b.id, b.is_active)} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(b.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {banners.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Nenhum banner cadastrado. A Home utilizará o padrão.
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
