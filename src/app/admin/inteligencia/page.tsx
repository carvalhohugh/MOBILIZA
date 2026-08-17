"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BrainCircuit, PieChart as PieChartIcon, Target, TrendingUp, Sparkles, MapPin, RefreshCw } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const ESTADOS = [
  { id: "AC", nome: "Acre" }, { id: "AL", nome: "Alagoas" }, { id: "AP", nome: "Amapá" },
  { id: "AM", nome: "Amazonas" }, { id: "BA", nome: "Bahia" }, { id: "CE", nome: "Ceará" },
  { id: "DF", nome: "Distrito Federal" }, { id: "ES", nome: "Espírito Santo" }, { id: "GO", nome: "Goiás" },
  { id: "MA", nome: "Maranhão" }, { id: "MT", nome: "Mato Grosso" }, { id: "MS", nome: "Mato Grosso do Sul" },
  { id: "MG", nome: "Minas Gerais" }, { id: "PA", nome: "Pará" }, { id: "PB", nome: "Paraíba" },
  { id: "PR", nome: "Paraná" }, { id: "PE", nome: "Pernambuco" }, { id: "PI", nome: "Piauí" },
  { id: "RJ", nome: "Rio de Janeiro" }, { id: "RN", nome: "Rio Grande do Norte" }, { id: "RS", nome: "Rio Grande do Sul" },
  { id: "RO", nome: "Rondônia" }, { id: "RR", nome: "Roraima" }, { id: "SC", nome: "Santa Catarina" },
  { id: "SP", nome: "São Paulo" }, { id: "SE", nome: "Sergipe" }, { id: "TO", nome: "Tocantins" },
];

const dataGender = [
  { name: 'Feminino', value: 52 },
  { name: 'Masculino', value: 48 },
];
const COLORS = ['#dc2626', '#1f2937'];

const dataAge = [
  { name: '16-24', populacao: 15 },
  { name: '25-34', populacao: 25 },
  { name: '35-44', populacao: 20 },
  { name: '45-59', populacao: 25 },
  { name: '60+', populacao: 15 },
];

export default function InteligenciaPage() {
  const [region, setRegion] = useState("SP");
  const [generating, setGenerating] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    setGenerating(true);
    setInsights(null);
    
    const estadoSelecionado = ESTADOS.find(e => e.id === region)?.nome || "Geral";
    const prompt = `Você é um Consultor Político Estrategista do partido MOBILIZA 33.
Analise o cenário político e demográfico do Estado de: ${estadoSelecionado}.
Sabendo que o público nacional gira em torno de 52% feminino, e a maior fatia de eleitores tem entre 25 a 59 anos, gere uma Análise de Inteligência Eleitoral em formato HTML básico (use <b>, <ul>, <li>, <p>).
A análise deve conter:
1. Uma estimativa simulada realista de Quociente Eleitoral para deputados nesse estado.
2. 3 Pautas Estratégicas Focadas nas mulheres.
3. 2 Dicas de Comunicação Digital para jovens adultos.
Seja conciso, profissional e persuasivo. Não use blocos de código (markdown de código), apenas responda com o HTML direto.`;

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });

      const data = await res.json();
      
      if (res.ok && data.text) {
        setInsights(data.text);
      } else {
        alert(data.error || "Erro ao conectar com a Inteligência Artificial.");
      }
    } catch (err) {
      console.error(err);
      alert("Falha de conexão com a API de IA.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-red-600" /> Inteligência Eleitoral
          </h1>
          <p className="text-muted-foreground mt-2">
            Cruzamento de dados demográficos e IA para estratégias de campanha.
          </p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0 items-center">
          <MapPin className="text-muted-foreground w-4 h-4" />
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione a Região" />
            </SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="BR">Brasil (Nacional)</SelectItem>
              {ESTADOS.map(uf => (
                <SelectItem key={uf.id} value={uf.id}>{uf.nome} ({uf.id})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* DASHBOARD GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <Card className="col-span-1 border-t-4 border-t-red-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-red-600" /> Eleitorado por Sexo
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dataGender} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {dataGender.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 text-sm mt-2 font-bold">
              <span className="text-red-600">Feminino (52%)</span>
              <span className="text-neutral-800">Masculino (48%)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-2 border-t-4 border-t-neutral-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neutral-800" /> Faixa Etária Estimada
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataAge}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="populacao" fill="#dc2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* IA CONSULTORIA */}
      <Card className="border-2 border-red-100 bg-red-50/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Target className="w-5 h-5" /> Consultoria IA Real - Gerador de Pautas
          </CardTitle>
          <CardDescription>
            Usa Inteligência Artificial (Gemini) para cruzar dados e sugerir o tom da campanha ideal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!insights ? (
            <div className="text-center py-8">
              <Button size="lg" className="bg-red-600 hover:bg-red-700 font-bold" onClick={handleGenerateInsights} disabled={generating}>
                {generating ? (
                  <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Processando na Nuvem...</span>
                ) : (
                  <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Analisar Cenário em Tempo Real</span>
                )}
              </Button>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg border border-red-100 shadow-sm relative">
              <Sparkles className="w-6 h-6 text-yellow-500 absolute top-4 right-4" />
              <h3 className="font-bold text-lg mb-4 text-neutral-900">Estratégia Gerada pela IA:</h3>
              <div 
                className="prose prose-red max-w-none text-neutral-700 text-sm md:text-base leading-relaxed" 
                dangerouslySetInnerHTML={{ __html: insights }} 
              />
              <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={() => setInsights(null)}>Gerar Nova Análise</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
