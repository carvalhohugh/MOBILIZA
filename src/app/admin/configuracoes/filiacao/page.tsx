"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, PlusCircle, Edit } from "lucide-react";

export default function ConfigFiliacaoPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [participations, setParticipations] = useState<any[]>([]);
  const [interests, setInterests] = useState<any[]>([]);
  
  // New Item States
  const [newDoc, setNewDoc] = useState({ title: "", url: "", is_required: true });
  const [newPart, setNewPart] = useState({ name: "", description: "" });
  const [newInt, setNewInt] = useState({ name: "" });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [docsRes, partRes, intRes] = await Promise.all([
      supabase.from('membership_documents').select('*').order('created_at', { ascending: false }),
      supabase.from('membership_participation').select('*').order('created_at', { ascending: false }),
      supabase.from('membership_interests').select('*').order('created_at', { ascending: false })
    ]);
    
    if (docsRes.data) setDocuments(docsRes.data);
    if (partRes.data) setParticipations(partRes.data);
    if (intRes.data) setInterests(intRes.data);
  }

  // --- Documents Handlers ---
  async function addDocument() {
    if (!newDoc.title) return;
    await supabase.from('membership_documents').insert([newDoc]);
    setNewDoc({ title: "", url: "", is_required: true });
    fetchData();
  }
  async function toggleDoc(id: string, current: boolean) {
    await supabase.from('membership_documents').update({ is_active: !current }).eq('id', id);
    fetchData();
  }
  async function deleteDoc(id: string) {
    if(confirm("Excluir documento?")) {
      await supabase.from('membership_documents').delete().eq('id', id);
      fetchData();
    }
  }

  // --- Participation Handlers ---
  async function addParticipation() {
    if (!newPart.name) return;
    await supabase.from('membership_participation').insert([newPart]);
    setNewPart({ name: "", description: "" });
    fetchData();
  }
  async function togglePart(id: string, current: boolean) {
    await supabase.from('membership_participation').update({ is_active: !current }).eq('id', id);
    fetchData();
  }
  async function deletePart(id: string) {
    if(confirm("Excluir opção de participação?")) {
      await supabase.from('membership_participation').delete().eq('id', id);
      fetchData();
    }
  }

  // --- Interests Handlers ---
  async function addInterest() {
    if (!newInt.name) return;
    await supabase.from('membership_interests').insert([newInt]);
    setNewInt({ name: "" });
    fetchData();
  }
  async function toggleInt(id: string, current: boolean) {
    await supabase.from('membership_interests').update({ is_active: !current }).eq('id', id);
    fetchData();
  }
  async function deleteInt(id: string) {
    if(confirm("Excluir área de interesse?")) {
      await supabase.from('membership_interests').delete().eq('id', id);
      fetchData();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Painel do Módulo de Filiação (Wizard)</h1>
        <p className="text-muted-foreground mt-2">
          Configure documentos, opções e regras que aparecem dinamicamente no formulário público.
        </p>
      </div>

      <Tabs defaultValue="documentos" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="documentos">Documentos / Links</TabsTrigger>
          <TabsTrigger value="participacao">Participação</TabsTrigger>
          <TabsTrigger value="interesses">Interesses</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais do Módulo</CardTitle>
              <CardDescription>Ative ou desative o recebimento de novas filiações pelo site.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">Módulo de Filiação Online</h3>
                  <p className="text-sm text-muted-foreground">Permite que usuários preencham a ficha pelo site.</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="font-bold text-lg">Exigir Aprovação Manual</h3>
                  <p className="text-sm text-muted-foreground">Filiações caem como "Pendente" até um admin aprovar.</p>
                </div>
                <Switch checked={true} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Links e Documentos Exigidos (Etapa 8)</CardTitle>
              <CardDescription>Defina os documentos que o usuário deve ler ou concordar.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 bg-neutral-50 p-4 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Label>Título do Documento</Label>
                  <Input value={newDoc.title} onChange={e => setNewDoc({...newDoc, title: e.target.value})} placeholder="Ex: Estatuto do Mobiliza 33" />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Link (URL)</Label>
                  <Input value={newDoc.url} onChange={e => setNewDoc({...newDoc, url: e.target.value})} placeholder="https://..." />
                </div>
                <div className="w-32 flex flex-col justify-end">
                  <Button onClick={addDocument} className="w-full bg-red-600 hover:bg-red-700 text-white"><PlusCircle className="w-4 h-4 mr-2"/> Add</Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento / Termo</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead>Obrigatório</TableHead>
                    <TableHead>Status (Ativo)</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map(doc => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-bold">{doc.title}</TableCell>
                      <TableCell className="text-sm text-blue-600 truncate max-w-[200px]">{doc.url || 'N/A'}</TableCell>
                      <TableCell>{doc.is_required ? "SIM" : "NÃO"}</TableCell>
                      <TableCell>
                        <Switch checked={doc.is_active} onCheckedChange={() => toggleDoc(doc.id, doc.is_active)} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteDoc(doc.id)}><Trash2 className="w-4 h-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participacao" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Como Gostaria de Participar (Etapa 5)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 bg-neutral-50 p-4 rounded-lg border">
                <div className="flex-1 space-y-2">
                  <Label>Nome da Opção</Label>
                  <Input value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})} placeholder="Ex: Voluntariado" />
                </div>
                <div className="flex-[2] space-y-2">
                  <Label>Descrição</Label>
                  <Input value={newPart.description} onChange={e => setNewPart({...newPart, description: e.target.value})} placeholder="Explique do que se trata..." />
                </div>
                <div className="w-32 flex flex-col justify-end">
                  <Button onClick={addParticipation} className="w-full bg-red-600 hover:bg-red-700 text-white"><PlusCircle className="w-4 h-4 mr-2"/> Add</Button>
                </div>
              </div>
              <Table>
                <TableBody>
                  {participations.map(p => (
                    <TableRow key={p.id}>
                      <TableCell className="font-bold">{p.name}</TableCell>
                      <TableCell className="text-sm text-neutral-500">{p.description}</TableCell>
                      <TableCell><Switch checked={p.is_active} onCheckedChange={() => togglePart(p.id, p.is_active)} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deletePart(p.id)}><Trash2 className="w-4 h-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interesses" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Áreas de Interesse Temático (Etapa 6)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6 bg-neutral-50 p-4 rounded-lg border max-w-xl">
                <div className="flex-1 space-y-2">
                  <Label>Nova Área</Label>
                  <Input value={newInt.name} onChange={e => setNewInt({...newInt, name: e.target.value})} placeholder="Ex: Educação Inclusiva" />
                </div>
                <div className="w-32 flex flex-col justify-end">
                  <Button onClick={addInterest} className="w-full bg-red-600 hover:bg-red-700 text-white"><PlusCircle className="w-4 h-4 mr-2"/> Add</Button>
                </div>
              </div>
              <Table className="max-w-xl">
                <TableBody>
                  {interests.map(i => (
                    <TableRow key={i.id}>
                      <TableCell className="font-bold">{i.name}</TableCell>
                      <TableCell><Switch checked={i.is_active} onCheckedChange={() => toggleInt(i.id, i.is_active)} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => deleteInt(i.id)}><Trash2 className="w-4 h-4"/></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
