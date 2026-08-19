"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, CheckCircle, Ban, Trash2, XCircle, Camera, Upload, X, User } from "lucide-react";

export default function FiliacoesPage() {
  const [filiations, setFiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      if (selectedProfile && selectedProfile.id === id) {
        setSelectedProfile({ ...selectedProfile, status: newStatus });
      }
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Tem certeza que deseja excluir esta filiação permanentemente?")) {
      await supabase.from('filiations').delete().eq('id', id);
      fetchFiliations();
      if (selectedProfile && selectedProfile.id === id) {
        setSelectedProfile(null);
      }
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedProfile) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        await updatePhoto(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const openCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert("Erro ao acessar a câmera.");
      setIsCameraOpen(false);
    }
  };

  const takePhoto = async () => {
    if (videoRef.current && canvasRef.current && selectedProfile) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context?.drawImage(videoRef.current, 0, 0);
      const base64 = canvasRef.current.toDataURL('image/jpeg');
      
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraOpen(false);

      await updatePhoto(base64);
    }
  };

  const updatePhoto = async (base64: string) => {
    if (!selectedProfile) return;
    await supabase.from('filiations').update({ photo_url: base64 }).eq('id', selectedProfile.id);
    setSelectedProfile({ ...selectedProfile, photo_url: base64 });
    fetchFiliations();
  };

  const closeCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  return (
    <div className="flex flex-col gap-6 relative text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white dark:text-white sm:text-black">Gestão de Filiações (Usuários)</h1>
          <p className="text-muted-foreground mt-2">
            Aprove, rejeite ou suspenda membros do partido que solicitaram filiação pelo site.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700 text-white">
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
                    <TableCell>
                      <div 
                        className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-1 rounded-md"
                        onClick={() => setSelectedProfile(f)}
                      >
                        <div className="w-10 h-10 rounded-full bg-neutral-200 border flex items-center justify-center overflow-hidden shrink-0">
                          {f.photo_url ? (
                            <img src={f.photo_url} alt={f.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-neutral-500">{f.full_name?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <span className="font-bold">{f.full_name}</span>
                      </div>
                    </TableCell>
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
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setSelectedProfile(f)} className="cursor-pointer font-bold">
                            <User className="mr-2 h-4 w-4" />
                            <span>Ver Perfil</span>
                          </DropdownMenuItem>
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

      {/* Drawer do Perfil */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={() => { setSelectedProfile(null); closeCamera(); }}>
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col overflow-y-auto animate-in slide-in-from-right" onClick={e => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b bg-neutral-50">
              <h2 className="text-xl font-bold">Perfil do Filiado</h2>
              <button onClick={() => { setSelectedProfile(null); closeCamera(); }} className="p-2 hover:bg-neutral-200 rounded-full text-black">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col items-center border-b">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg bg-neutral-200 overflow-hidden mb-4 relative group">
                {selectedProfile.photo_url ? (
                  <img src={selectedProfile.photo_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold text-neutral-400 flex items-center justify-center h-full">
                    {selectedProfile.full_name?.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-2">
                    <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-white rounded-full hover:bg-neutral-200" title="Fazer Upload">
                      <Upload className="w-4 h-4 text-black" />
                    </button>
                    <button onClick={openCamera} className="p-2 bg-white rounded-full hover:bg-neutral-200" title="Tirar Foto">
                      <Camera className="w-4 h-4 text-black" />
                    </button>
                  </div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
              </div>

              {isCameraOpen && (
                <div className="w-full mb-4 flex flex-col items-center">
                  <video ref={videoRef} autoPlay playsInline className="w-full max-w-[200px] bg-black rounded-lg mb-2"></video>
                  <canvas ref={canvasRef} className="hidden"></canvas>
                  <div className="flex gap-2">
                    <Button onClick={takePhoto} size="sm" className="bg-red-600 hover:bg-red-700 text-white">Capturar</Button>
                    <Button onClick={closeCamera} size="sm" variant="outline">Cancelar</Button>
                  </div>
                </div>
              )}

              <h3 className="text-2xl font-bold text-center">{selectedProfile.full_name}</h3>
              <span className={`mt-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                ${selectedProfile.status === 'APROVADO' ? 'bg-green-100 text-green-800' : 
                  selectedProfile.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 
                  selectedProfile.status === 'SUSPENSO' ? 'bg-orange-100 text-orange-800' : 
                  'bg-yellow-100 text-yellow-800'}`}>
                {selectedProfile.status}
              </span>
            </div>

            <div className="p-6 space-y-4 flex-1">
              <div>
                <p className="text-sm text-neutral-500 font-medium">CPF</p>
                <p className="font-mono">{selectedProfile.cpf}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Data de Nascimento</p>
                <p>{selectedProfile.birth_date ? new Date(selectedProfile.birth_date).toLocaleDateString('pt-BR') : 'Não informada'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Email</p>
                <p>{selectedProfile.email}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">WhatsApp / Telefone</p>
                <p>{selectedProfile.whatsapp || selectedProfile.phone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Localidade</p>
                <p>{selectedProfile.city} - {selectedProfile.state_id}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Título Eleitoral</p>
                <p>{selectedProfile.voter_title || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-500 font-medium">Data de Cadastro</p>
                <p>{new Date(selectedProfile.created_at).toLocaleString('pt-BR')}</p>
              </div>
            </div>

            <div className="p-4 border-t bg-neutral-50 flex gap-2">
              <Button onClick={() => handleStatusChange(selectedProfile.id, 'APROVADO')} className="flex-1 bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="w-4 h-4 mr-2" /> Aprovar
              </Button>
              <Button onClick={() => handleStatusChange(selectedProfile.id, 'REJEITADO')} className="flex-1 bg-red-600 hover:bg-red-700 text-white">
                <XCircle className="w-4 h-4 mr-2" /> Rejeitar
              </Button>
            </div>
            <div className="p-4 pt-0 border-t-0 bg-neutral-50 flex gap-2">
              <Button onClick={() => handleStatusChange(selectedProfile.id, 'SUSPENSO')} variant="outline" className="flex-1 text-orange-600 border-orange-600 hover:bg-orange-50">
                <Ban className="w-4 h-4 mr-2" /> Suspender
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
