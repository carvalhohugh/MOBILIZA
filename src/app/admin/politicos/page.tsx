"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Ban, Trash2 } from "lucide-react";

const ROLES = [
  "Governador", 
  "Vice Governador", 
  "Senador", 
  "Deputado Federal", 
  "Deputado Estadual", 
  "Prefeito", 
  "Vereador"
];

export default function PoliticosPage() {
  const [politicians, setPoliticians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form
  const [name, setName] = useState("");
  const [role, setRole] = useState(ROLES[0]);
  const [stateId, setStateId] = useState("");
  const [city, setCity] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [votes, setVotes] = useState("");

  useEffect(() => {
    fetchPoliticians();
  }, []);

  async function fetchPoliticians() {
    const { data } = await supabase.from('politicians').select('*').order('created_at', { ascending: false });
    if (data) setPoliticians(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('politicians').insert([
      { 
        name, 
        role, 
        state_id: stateId.toUpperCase(), 
        city, 
        photo_url: photoUrl,
        last_election_votes: votes ? parseInt(votes) : null
      }
    ]);

    if (!error) {
      alert("Candidato/Eleito salvo com sucesso!");
      setName(""); setStateId(""); setCity(""); setPhotoUrl(""); setVotes("");
      fetchPoliticians();
    } else {
      alert("Erro ao salvar: " + error.message);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir?")) {
      await supabase.from('politicians').delete().eq('id', id);
      fetchPoliticians();
    }
  }

  async function handleDuplicate(pol: any) {
    if (confirm(`Duplicar o cadastro de ${pol.name}?`)) {
      const { id, created_at, updated_at, ...rest } = pol;
      await supabase.from('politicians').insert([{ ...rest, name: `${pol.name} (Cópia)` }]);
      fetchPoliticians();
    }
  }

  async function handleSuspend(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'INATIVO' ? 'ATIVO' : 'INATIVO';
    if (confirm(`Mudar status para ${newStatus}?`)) {
      await supabase.from('politicians').update({ status: newStatus }).eq('id', id);
      fetchPoliticians();
    }
  }

  function handleEdit(pol: any) {
    // Fill the form for editing (simple approach)
    setName(pol.name);
    setRole(pol.role);
    setStateId(pol.state_id);
    setCity(pol.city || "");
    setPhotoUrl(pol.photo_url || "");
    setVotes(pol.last_election_votes?.toString() || "");
    // Note: a real edit would require tracking the editing ID to run an UPDATE instead of INSERT.
    // To keep it simple in this mock phase, we just populate the fields.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div className="grid gap-8 grid-cols-1 xl:grid-cols-3">
      {/* Formulário */}
      <Card className="xl:col-span-1 h-fit">
        <CardHeader>
          <CardTitle>Cadastrar Político</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo (Urna)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: João da Silva" />
            </div>

            <div className="space-y-2">
              <Label>Cargo</Label>
              <Select value={role} onValueChange={(v: any) => v && (v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                <Input value={stateId} onChange={(e) => setStateId(e.target.value)} required maxLength={2} placeholder="SP" />
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ex: Campinas" disabled={role === 'Governador' || role === 'Senador' || role === 'Presidente'} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Votos na Última Eleição (TSE/STE)</Label>
              <Input type="number" value={votes} onChange={(e) => setVotes(e.target.value)} placeholder="Ex: 154000" />
              <p className="text-xs text-neutral-500">Isso será exibido no card público simulando integração.</p>
            </div>

            <div className="space-y-2">
              <Label>Foto do Político (URL)</Label>
              <Input value={photoUrl} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>

            <Button type="submit" className="w-full bg-neutral-900 hover:bg-black text-white uppercase tracking-widest font-bold">Salvar Político</Button>
          </form>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle>Base de Políticos e Lideranças</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Foto</TableHead>
                  <TableHead>Nome e Cargo</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Votos TSE</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {politicians.map((pol) => (
                  <TableRow key={pol.id}>
                    <TableCell>
                      {pol.photo_url ? (
                        <div className="h-10 w-10 rounded-full bg-cover bg-center border" style={{ backgroundImage: `url(${pol.photo_url})` }} />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-xs">Sem</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-bold">{pol.name}</p>
                      <p className="text-xs text-neutral-500 uppercase">{pol.role}</p>
                    </TableCell>
                    <TableCell>{pol.city ? `${pol.city} - ` : ''}{pol.state_id}</TableCell>
                    <TableCell>{pol.last_election_votes?.toLocaleString('pt-BR') || '---'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(pol)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(pol)} className="cursor-pointer">
                            <Copy className="mr-2 h-4 w-4 text-neutral-600" />
                            <span>Duplicar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSuspend(pol.id, pol.status)} className="cursor-pointer">
                            <Ban className="mr-2 h-4 w-4 text-orange-600" />
                            <span>{pol.status === 'INATIVO' ? 'Reativar' : 'Suspender'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(pol.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
