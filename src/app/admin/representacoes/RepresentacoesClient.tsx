"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Copy, Ban, Trash2, CheckCircle } from "lucide-react";

type Representation = {
  id: string;
  name: string;
  state_id: string;
  city: string;
  type: string;
  status: string;
};

export function RepresentacoesClient() {
  const [representations, setRepresentations] = useState<Representation[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [city, setCity] = useState("");
  const [type, setType] = useState("MUNICIPAL");
  const [status, setStatus] = useState("ATIVA");

  useEffect(() => {
    fetchRepresentations();

    // Set up Realtime Subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'representations' },
        (payload) => {
          console.log('Change received!', payload);
          fetchRepresentations(); // Refresh list on change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchRepresentations() {
    const { data, error } = await supabase
      .from('representations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching representations:', error);
    } else {
      setRepresentations(data || []);
    }
    setLoading(false);
  }

  async function geocodeAddress(city: string, state: string) {
    try {
      const query = encodeURIComponent(`${city}, ${state}, Brazil`);
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.error("Geocoding failed", e);
    }
    return { latitude: null, longitude: null };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    // Buscar coordenadas automaticamente
    const coords = await geocodeAddress(city, stateId);

    const { error } = await supabase
      .from('representations')
      .insert([
        { 
          name, 
          state_id: stateId, 
          city, 
          type, 
          status,
          latitude: coords.latitude,
          longitude: coords.longitude
        }
      ]);

    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      // Clear form
      setName("");
      setStateId("");
      setCity("");
      setType("MUNICIPAL");
      setStatus("ATIVA");
    }
  }

  async function deleteRepresentation(id: string) {
    if (confirm("Tem certeza que deseja excluir esta representação?")) {
      const { error } = await supabase
        .from('representations')
        .delete()
        .eq('id', id);
      
      if (error) {
        alert("Erro ao excluir: " + error.message);
      }
    }
  }

  async function handleDuplicate(rep: Representation) {
    if (confirm(`Duplicar a representação ${rep.name}?`)) {
      const { id, ...rest } = rep;
      await supabase.from('representations').insert([{ ...rest, name: `${rep.name} (Cópia)` }]);
    }
  }

  async function handleStatusToggle(id: string, currentStatus: string) {
    let newStatus = currentStatus === 'ATIVA' ? 'INATIVA' : 'ATIVA';
    if (currentStatus === 'IMPLANTACAO') newStatus = 'ATIVA';

    if (confirm(`Mudar status para ${newStatus}?`)) {
      await supabase.from('representations').update({ status: newStatus }).eq('id', id);
    }
  }

  function handleEdit(rep: Representation) {
    setName(rep.name);
    setStateId(rep.state_id);
    setCity(rep.city);
    setType(rep.type);
    setStatus(rep.status);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Mock Data Logic
  const mockData = [
    { name: "Sede AC", state_id: "AC", city: "Rio Branco", type: "ESTADUAL", status: "ATIVA", latitude: -9.97499, longitude: -67.8243 },
    { name: "Sede AL", state_id: "AL", city: "Maceió", type: "ESTADUAL", status: "ATIVA", latitude: -9.66599, longitude: -35.735 },
    { name: "Sede AP", state_id: "AP", city: "Macapá", type: "ESTADUAL", status: "ATIVA", latitude: 0.034934, longitude: -51.0694 },
    { name: "Sede AM", state_id: "AM", city: "Manaus", type: "ESTADUAL", status: "ATIVA", latitude: -3.10719, longitude: -60.0261 },
    { name: "Sede BA", state_id: "BA", city: "Salvador", type: "ESTADUAL", status: "ATIVA", latitude: -12.9718, longitude: -38.5011 },
    { name: "Sede CE", state_id: "CE", city: "Fortaleza", type: "ESTADUAL", status: "ATIVA", latitude: -3.71839, longitude: -38.5434 },
    { name: "Sede DF", state_id: "DF", city: "Brasília", type: "SEDE", status: "ATIVA", latitude: -15.7797, longitude: -47.9297 },
    { name: "Sede ES", state_id: "ES", city: "Vitória", type: "ESTADUAL", status: "ATIVA", latitude: -20.3155, longitude: -40.3128 },
    { name: "Sede GO", state_id: "GO", city: "Goiânia", type: "ESTADUAL", status: "ATIVA", latitude: -16.6864, longitude: -49.2643 },
    { name: "Sede MA", state_id: "MA", city: "São Luís", type: "ESTADUAL", status: "ATIVA", latitude: -2.52972, longitude: -44.3028 },
    { name: "Sede MT", state_id: "MT", city: "Cuiabá", type: "ESTADUAL", status: "ATIVA", latitude: -15.5989, longitude: -56.0949 },
    { name: "Sede MS", state_id: "MS", city: "Campo Grande", type: "ESTADUAL", status: "ATIVA", latitude: -20.4428, longitude: -54.6464 },
    { name: "Sede MG", state_id: "MG", city: "Belo Horizonte", type: "ESTADUAL", status: "ATIVA", latitude: -19.9208, longitude: -43.9378 },
    { name: "Sede PA", state_id: "PA", city: "Belém", type: "ESTADUAL", status: "ATIVA", latitude: -1.45502, longitude: -48.5024 },
    { name: "Sede PB", state_id: "PB", city: "João Pessoa", type: "ESTADUAL", status: "ATIVA", latitude: -7.11532, longitude: -34.861 },
    { name: "Sede PR", state_id: "PR", city: "Curitiba", type: "ESTADUAL", status: "ATIVA", latitude: -25.4284, longitude: -49.2733 },
    { name: "Sede PE", state_id: "PE", city: "Recife", type: "ESTADUAL", status: "ATIVA", latitude: -8.05428, longitude: -34.8813 },
    { name: "Sede PI", state_id: "PI", city: "Teresina", type: "ESTADUAL", status: "ATIVA", latitude: -5.08921, longitude: -42.8016 },
    { name: "Sede RJ", state_id: "RJ", city: "Rio de Janeiro", type: "ESTADUAL", status: "ATIVA", latitude: -22.9068, longitude: -43.1729 },
    { name: "Sede RN", state_id: "RN", city: "Natal", type: "ESTADUAL", status: "ATIVA", latitude: -5.79448, longitude: -35.211 },
    { name: "Sede RS", state_id: "RS", city: "Porto Alegre", type: "ESTADUAL", status: "ATIVA", latitude: -30.0277, longitude: -51.2287 },
    { name: "Sede RO", state_id: "RO", city: "Porto Velho", type: "ESTADUAL", status: "ATIVA", latitude: -8.76116, longitude: -63.9004 },
    { name: "Sede RR", state_id: "RR", city: "Boa Vista", type: "ESTADUAL", status: "ATIVA", latitude: 2.81972, longitude: -60.6733 },
    { name: "Sede SC", state_id: "SC", city: "Florianópolis", type: "ESTADUAL", status: "ATIVA", latitude: -27.5969, longitude: -48.5495 },
    { name: "Sede SP", state_id: "SP", city: "São Paulo", type: "ESTADUAL", status: "ATIVA", latitude: -23.5489, longitude: -46.6388 },
    { name: "Sede SE", state_id: "SE", city: "Aracaju", type: "ESTADUAL", status: "ATIVA", latitude: -10.9472, longitude: -37.0731 },
    { name: "Sede TO", state_id: "TO", city: "Palmas", type: "ESTADUAL", status: "ATIVA", latitude: -10.2128, longitude: -48.3603 },
  ];

  async function generateMocks() {
    setLoading(true);
    for (const mock of mockData) {
      await supabase.from('representations').insert([mock]);
    }
    await fetchRepresentations();
    alert("Dados Mocks gerados com sucesso!");
  }

  async function removeMocks() {
    setLoading(true);
    const { error } = await supabase
      .from('representations')
      .delete()
      .like('name', 'Sede %');
    if (!error) {
      await fetchRepresentations();
      alert("Dados Mocks removidos!");
    } else {
      alert("Erro ao remover: " + error.message);
    }
  }

  return (
    <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
      {/* Formulário de Cadastro */}
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Controle de Mocks</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button variant="outline" className="w-full bg-blue-50 text-blue-700 hover:bg-blue-100" onClick={generateMocks}>
              Gerar 27 Mocks (Estados + DF)
            </Button>
            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50" onClick={removeMocks}>
              Desativar / Apagar Mocks
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
          <CardTitle>Nova Representação</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Representação</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Diretório Catalão" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="state">Estado (UF)</Label>
              <Input id="state" value={stateId} onChange={(e) => setStateId(e.target.value)} required maxLength={2} placeholder="GO" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Município</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required placeholder="Catalão" />
            </div>

            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(v: any) => v && (v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MUNICIPAL">Municipal</SelectItem>
                  <SelectItem value="ESTADUAL">Estadual</SelectItem>
                  <SelectItem value="SEDE">Sede Nacional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v: any) => v && (v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ATIVA">Ativa</SelectItem>
                  <SelectItem value="IMPLANTACAO">Em Implantação</SelectItem>
                  <SelectItem value="INATIVA">Inativa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
              Salvar Representação
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>

      {/* Lista de Representações */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Representações Cadastradas</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {representations.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Nenhuma representação cadastrada.
                    </TableCell>
                  </TableRow>
                )}
                {representations.map((rep) => (
                  <TableRow key={rep.id}>
                    <TableCell className="font-medium">{rep.name}</TableCell>
                    <TableCell>{rep.city} - {rep.state_id}</TableCell>
                    <TableCell>{rep.type}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold
                        ${rep.status === 'ATIVA' ? 'bg-green-100 text-green-800' : 
                          rep.status === 'INATIVA' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                        {rep.status}
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
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleEdit(rep)} className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4 text-blue-600" />
                            <span>Editar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(rep)} className="cursor-pointer">
                            <Copy className="mr-2 h-4 w-4 text-neutral-600" />
                            <span>Duplicar</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusToggle(rep.id, rep.status)} className="cursor-pointer">
                            {rep.status === 'ATIVA' ? (
                              <Ban className="mr-2 h-4 w-4 text-orange-600" />
                            ) : (
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                            )}
                            <span>{rep.status === 'ATIVA' ? 'Inativar' : 'Ativar'}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => deleteRepresentation(rep.id)} className="cursor-pointer text-red-600 focus:text-red-600">
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
