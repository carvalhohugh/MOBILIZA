"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, CheckCircle, Ban, ArrowDownToLine } from "lucide-react";

type Donation = {
  id: string;
  donor_name: string;
  donor_cpf: string;
  donor_email: string;
  amount: number;
  status: string;
  created_at: string;
};

export default function FinanceiroPage() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    setLoading(true);
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      setDonations(data);
    }
    setLoading(false);
  }

  async function handleStatusChange(id: string, newStatus: string) {
    if (confirm(`Alterar o status desta doação para ${newStatus}?`)) {
      await supabase.from('donations').update({ status: newStatus }).eq('id', id);
      fetchDonations();
    }
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const totalAmount = donations.filter(d => d.status === 'COMPLETED').reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financeiro & Doações</h1>
        <p className="text-muted-foreground mt-2">
          Controle de arrecadação via PIX para prestação de contas ao TSE.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-red-600 text-white shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider font-bold">Total Arrecadado (Confirmado)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-500 uppercase tracking-wider font-bold">Doações Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-neutral-800">
              {donations.filter(d => d.status === 'PENDING').length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-neutral-500 uppercase tracking-wider font-bold">Doações Recebidas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-black text-green-600">
              {donations.filter(d => d.status === 'COMPLETED').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Histórico de Transações</CardTitle>
          <Button variant="outline" className="gap-2">
            <ArrowDownToLine className="w-4 h-4" />
            Exportar TSE
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando transações...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Doador</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma doação registrada ainda.
                    </TableCell>
                  </TableRow>
                )}
                {donations.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>{new Date(d.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="font-bold">
                      {d.donor_name}
                      <span className="block text-xs font-normal text-neutral-500">{d.donor_email}</span>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{d.donor_cpf}</TableCell>
                    <TableCell className="font-bold text-red-600">{formatCurrency(d.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'COMPLETED' ? 'default' : d.status === 'PENDING' ? 'outline' : 'destructive'} 
                             className={d.status === 'COMPLETED' ? 'bg-green-600 hover:bg-green-700' : ''}>
                        {d.status === 'COMPLETED' ? 'Confirmado' : d.status === 'PENDING' ? 'Aguardando Pagamento' : 'Falha/Cancelado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Atualizar Status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatusChange(d.id, 'COMPLETED')} className="cursor-pointer text-green-600 focus:text-green-600">
                            <CheckCircle className="mr-2 h-4 w-4" /> Confirmar Pagamento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(d.id, 'PENDING')} className="cursor-pointer">
                            Marcar como Pendente
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(d.id, 'FAILED')} className="cursor-pointer text-red-600 focus:text-red-600">
                            <Ban className="mr-2 h-4 w-4" /> Cancelar Transação
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
