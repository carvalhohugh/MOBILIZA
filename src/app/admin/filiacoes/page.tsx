"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CheckCircle, Ban, Trash2, XCircle } from "lucide-react";

export default function FiliacoesPage() {
  const [filiations, setFiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFiliations();
  }, []);

  async function fetchFiliations() {
    const { data } = await supabase.from('filiations').select('*').order('created_at', { ascending: false });
    if (data) setFiliations(data);
    setLoading(false);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if (confirm(`Mudar o status deste usuário para ${newStatus}?`)) {
      await supabase.from('filiations').update({ status: newStatus }).eq('id', id);
      fetchFiliations();
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir esta filiação permanentemente?")) {
      await supabase.from('filiations').delete().eq('id', id);
      fetchFiliations();
    }
  }

  function handleExportCSV() {
    if (filiations.length === 0) return alert("Nenhum dado para exportar.");
    
    const headers = ["Nome", "CPF", "Email", "WhatsApp", "Cidade", "Estado", "Status", "Data Cadastro"];
    const rows = filiations.map(f => [
      `"${f.full_name}"`, 
      `"${f.cpf}"`, 
      `"${f.email}"`, 
      `"${f.whatsapp || f.phone}"`, 
      `"${f.city}"`, 
      `"${f.state_id}"`, 
      `"${f.status}"`,
      `"${new Date(f.created_at).toLocaleDateString('pt-BR')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `filiados_mobiliza_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Filiações (Usuários)</h1>
          <p className="text-muted-foreground mt-2">
            Aprove, rejeite ou suspenda membros do partido que solicitaram filiação pelo site.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            Baixar Relatório CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitações e Membros</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <p>Carregando...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filiations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">Nenhum registro encontrado.</TableCell>
                  </TableRow>
                )}
                {filiations.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-bold">{f.full_name}</TableCell>
                    <TableCell className="font-mono text-sm">{f.cpf}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{f.email}</p>
                        <p className="text-neutral-500">{f.whatsapp || f.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{f.city} - {f.state_id}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                        ${f.status === 'APROVADO' ? 'bg-green-100 text-green-800' : 
                          f.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 
                          f.status === 'SUSPENSO' ? 'bg-orange-100 text-orange-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {f.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações (Status)</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(f.id, 'APROVADO')} className="cursor-pointer text-green-600 focus:text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            <span>Aprovar Filiação</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(f.id, 'REJEITADO')} className="cursor-pointer text-red-600 focus:text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            <span>Rejeitar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(f.id, 'SUSPENSO')} className="cursor-pointer text-orange-600 focus:text-orange-600">
                            <Ban className="mr-2 h-4 w-4" />
                            <span>Suspender</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(f.id, 'PENDENTE')} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Voltar para Pendente</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(f.id)} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Excluir Definitivamente</span>
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
