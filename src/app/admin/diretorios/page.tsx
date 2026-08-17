"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, RefreshCw, Building2, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function DiretoriosPage() {
  const [dirs, setDirs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isOpen, setIsOpen] = useState(false);
  const [level, setLevel] = useState("ESTADUAL");
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [city, setCity] = useState("");
  const [presidentName, setPresidentName] = useState("");

  const loadDirs = async () => {
    setLoading(true);
    const { data } = await supabase.from("directories").select("*").order("created_at", { ascending: false });
    if (data) setDirs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDirs();
  }, []);

  const handleAdd = async () => {
    if (!name || !level) return;
    
    const { error } = await supabase.from("directories").insert([{ 
      level, 
      name, 
      state_id: level !== 'NACIONAL' ? stateId : null, 
      city: level === 'MUNICIPAL' ? city : null,
      president_name: presidentName
    }]);

    if (error) {
      alert("Erro ao salvar diretório: " + error.message);
      return;
    }

    setIsOpen(false);
    setName("");
    setStateId("");
    setCity("");
    setPresidentName("");
    loadDirs();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remover este diretório?")) {
      await supabase.from("directories").delete().eq("id", id);
      loadDirs();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Diretórios</h1>
          <p className="text-muted-foreground mt-2">
            Administre os Diretórios Nacional, Estaduais e Municipais do partido.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" onClick={loadDirs}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Atualizar
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="w-4 h-4 mr-2" /> Novo Diretório
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Cadastrar Diretório</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nível Hierárquico</label>
                  <Select value={level} onValueChange={(v: any) => v && setLevel(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NACIONAL">Nacional</SelectItem>
                      <SelectItem value="ESTADUAL">Estadual</SelectItem>
                      <SelectItem value="REGIONAL">Regional</SelectItem>
                      <SelectItem value="MUNICIPAL">Municipal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome Oficial</label>
                  <Input placeholder="Ex: Diretório Municipal Goiânia" value={name} onChange={e => setName(e.target.value)} />
                </div>

                {level !== 'NACIONAL' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Estado (UF)</label>
                    <Input placeholder="Ex: GO" maxLength={2} value={stateId} onChange={e => setStateId(e.target.value.toUpperCase())} />
                  </div>
                )}

                {level === 'MUNICIPAL' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Cidade</label>
                    <Input placeholder="Ex: Goiânia" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Presidente / Gestor</label>
                  <Input placeholder="Nome do responsável" value={presidentName} onChange={e => setPresidentName(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
                <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700">Salvar Diretório</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card className="border-t-4 border-t-red-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Nacional</CardTitle>
            <div className="text-3xl font-bold">{dirs.filter(d => d.level === 'NACIONAL').length}</div>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-t-yellow-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Estaduais</CardTitle>
            <div className="text-3xl font-bold">{dirs.filter(d => d.level === 'ESTADUAL').length}</div>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-t-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Regionais</CardTitle>
            <div className="text-3xl font-bold">{dirs.filter(d => d.level === 'REGIONAL').length}</div>
          </CardHeader>
        </Card>
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Municipais</CardTitle>
            <div className="text-3xl font-bold">{dirs.filter(d => d.level === 'MUNICIPAL').length}</div>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nível</TableHead>
                <TableHead>Diretório</TableHead>
                <TableHead>Localidade</TableHead>
                <TableHead>Presidente</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dirs.map(dir => (
                <TableRow key={dir.id}>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                      dir.level === 'NACIONAL' ? 'bg-red-100 text-red-700' :
                      dir.level === 'ESTADUAL' ? 'bg-yellow-100 text-yellow-700' :
                      dir.level === 'REGIONAL' ? 'bg-purple-100 text-purple-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {dir.level}
                    </span>
                  </TableCell>
                  <TableCell className="font-bold flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    {dir.name}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-muted-foreground text-sm">
                      <MapPin className="w-3 h-3" />
                      {dir.level === 'NACIONAL' ? 'Sede Nacional' : `${dir.city ? dir.city + ' - ' : ''}${dir.state_id}`}
                    </span>
                  </TableCell>
                  <TableCell>{dir.president_name || '-'}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(dir.id)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {dirs.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Nenhum diretório cadastrado ainda.
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
