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

  const handleAdd = async () => {
    if (!newName || !newUrl) return;
    
    const { error } = await supabase.from("trusted_sources").insert([{ name: newName, rss_url: newUrl }]);
    
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
          <CardDescription>Insira o nome do portal e o link para o RSS Feed (.xml ou /feed)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <label className="text-sm font-medium">Nome do Site</label>
              <Input placeholder="Ex: G1 Política" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="space-y-2 flex-[2]">
              <label className="text-sm font-medium">URL do RSS</label>
              <Input placeholder="Ex: https://g1.globo.com/rss/g1/politica/" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
            </div>
            <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>
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
