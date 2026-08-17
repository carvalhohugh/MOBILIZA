"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, FileText, CheckCircle2, Clock, XCircle, Ban } from "lucide-react";

export default function AcompanharPage() {
  const [protocol, setProtocol] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocol.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setResult(null);

    const { data, error } = await supabase
      .from('filiations')
      .select('*')
      .eq('protocol', protocol.trim())
      .single();

    setLoading(false);

    if (error || !data) {
      setErrorMsg("Nenhuma solicitação encontrada com este número de protocolo.");
    } else {
      setResult(data);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'PENDENTE':
        return { color: 'text-yellow-600 bg-yellow-100 border-yellow-200', icon: Clock, label: 'Em Análise (Pendente)' };
      case 'APROVADO':
        return { color: 'text-green-700 bg-green-100 border-green-200', icon: CheckCircle2, label: 'Filiação Aprovada!' };
      case 'REJEITADO':
        return { color: 'text-red-700 bg-red-100 border-red-200', icon: XCircle, label: 'Solicitação Rejeitada' };
      case 'SUSPENSO':
        return { color: 'text-orange-700 bg-orange-100 border-orange-200', icon: Ban, label: 'Cadastro Suspenso' };
      default:
        return { color: 'text-neutral-600 bg-neutral-100 border-neutral-200', icon: FileText, label: status };
    }
  };

  return (
    <div className="min-h-[80vh] bg-neutral-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black uppercase tracking-tight text-neutral-900 mb-2">
            Acompanhar Solicitação
          </h1>
          <p className="text-neutral-600">
            Digite o número do protocolo gerado no final do seu cadastro de filiação.
          </p>
        </div>

        <Card className="shadow-xl border-t-8 border-t-red-600">
          <CardContent className="p-8">
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="protocol" className="uppercase font-bold text-neutral-500 text-xs">
                  Número do Protocolo
                </Label>
                <div className="flex gap-2">
                  <Input 
                    id="protocol"
                    value={protocol}
                    onChange={(e) => setProtocol(e.target.value.toUpperCase())}
                    placeholder="Ex: MOB-2026-123456"
                    className="h-14 text-lg font-mono tracking-widest uppercase border-2 focus-visible:ring-red-600"
                  />
                  <Button type="submit" disabled={loading} className="h-14 px-8 bg-red-600 hover:bg-red-700 text-white font-bold uppercase">
                    <Search className="w-5 h-5 mr-2" />
                    Buscar
                  </Button>
                </div>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium text-center">
                {errorMsg}
              </div>
            )}

            {result && (
              <div className="mt-8 pt-8 border-t border-neutral-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-xl font-bold mb-6 text-center text-neutral-900">Detalhes da Filiação</h3>
                
                <div className="space-y-6">
                  <div className="bg-neutral-50 p-4 rounded-lg border">
                    <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Status Atual</p>
                    <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${getStatusDisplay(result.status).color}`}>
                      {(() => {
                        const StatusIcon = getStatusDisplay(result.status).icon;
                        return <StatusIcon className="w-8 h-8" />;
                      })()}
                      <span className="font-black text-xl uppercase tracking-tight">
                        {getStatusDisplay(result.status).label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Solicitante</p>
                      <p className="font-bold text-neutral-900 truncate">{result.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Data da Solicitação</p>
                      <p className="font-bold text-neutral-900">
                        {new Date(result.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Localidade</p>
                      <p className="font-bold text-neutral-900">{result.city} - {result.state_id}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Etapa Parada</p>
                      <p className="font-bold text-neutral-900">
                        {result.current_step === 9 ? 'Concluída' : `Etapa ${result.current_step}`}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
