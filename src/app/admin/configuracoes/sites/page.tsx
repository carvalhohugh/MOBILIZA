"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw } from "lucide-react";

export default function SitesConfiaveisPage() {
  const [sites, setSites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");

  const loadSites = async () => {
    setLoading(true);
    const { data } = await supabase.from("trusted_sources").select("*").order("created_at", { ascending: false });
    if (data) setSites(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSites();
  }, []);

  const handleAdd = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newName || !newUrl) return;
    
    // Auto-discover the real RSS URL if the user typed a standard website
    let finalUrl = newUrl;
    try {
      const res = await fetch(`/api/discover?url=${encodeURIComponent(newUrl)}`);
      const data = await res.json();
      if (data.rssUrl) {
        finalUrl = data.rssUrl;
      }
    } catch (err) {
      console.error("Discovery failed, using provided url", err);
    }

    const { error } = await supabase.from("trusted_sources").insert([{ name: newName, rss_url: finalUrl, status: 'ATIVO' }]);
    
    if (error) {
      alert("Erro ao salvar: " + error.message);
      console.error(error);
      return;
    }

    setNewName("");
    setNewUrl("");
    loadSites();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este site da lista de confiáveis?")) {
      await supabase.from("trusted_sources").delete().eq("id", id);
      loadSites();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sites Confiáveis</h1>
        <p className="text-muted-foreground mt-2">
          Cadastre as fontes (feeds RSS) para a Curadoria de Notícias puxar as postagens diárias.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar Novo Site</CardTitle>
          <CardDescription>Insira o nome do portal e o link. O sistema tentará descobrir o Feed RSS automaticamente para você!</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Nome do Site</label>
              <Input placeholder="Ex: G1 Política" value={newName} onChange={e => setNewName(e.target.value)} required />
            </div>
            <div className="space-y-2 flex-[2]">
              <label className="text-sm font-medium">Link do Site ou URL do RSS</label>
              <Input placeholder="Ex: https://g1.globo.com/politica/" value={newUrl} onChange={e => setNewUrl(e.target.value)} type="url" required />
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
            <CardTitle>Sites Cadastrados</CardTitle>
            <CardDescription>Esses sites aparecerão no Painel de Curadoria.</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSites}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>RSS URL</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map(site => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell className="text-muted-foreground">{site.rss_url}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(site.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {sites.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum site cadastrado ainda.
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
