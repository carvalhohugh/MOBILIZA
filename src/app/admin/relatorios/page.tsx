"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";

export default function RelatoriosPage() {
  const [filiations, setFiliations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedMonth, setSelectedMonth] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase.from('filiations').select('*').order('created_at', { ascending: true });
      if (data) setFiliations(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return filiations.filter(f => {
      const d = new Date(f.created_at);
      const matchYear = selectedYear === "all" || d.getFullYear().toString() === selectedYear;
      const matchMonth = selectedMonth === "all" || (d.getMonth() + 1).toString() === selectedMonth;
      return matchYear && matchMonth;
    });
  }, [filiations, selectedMonth, selectedYear]);

  // KPI Calculations
  const totalOverall = filiations.length;
  const novosNoPeriodo = filteredData.length;
  const rejeitadosDesfiliados = filteredData.filter(f => f.status === 'REJEITADO' || f.status === 'SUSPENSO').length;
  const aprovados = filteredData.filter(f => f.status === 'APROVADO').length;
  const pendentes = filteredData.filter(f => f.status === 'PENDENTE').length;
  const taxaAprovacao = novosNoPeriodo > 0 ? ((aprovados / novosNoPeriodo) * 100).toFixed(1) : "0";

  // Chart 1: Curva de crescimento
  const growthData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(f => {
      const d = new Date(f.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData]);

  // Chart 2: Status
  const statusData = [
    { name: 'APROVADO', value: aprovados, color: '#16a34a' },
    { name: 'PENDENTE', value: pendentes, color: '#eab308' },
    { name: 'REJEITADO', value: filteredData.filter(f => f.status === 'REJEITADO').length, color: '#dc2626' },
    { name: 'SUSPENSO', value: filteredData.filter(f => f.status === 'SUSPENSO').length, color: '#ea580c' }
  ].filter(d => d.value > 0);

  // Table: Top 5 states
  const statesData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredData.forEach(f => {
      if (f.state_id) counts[f.state_id] = (counts[f.state_id] || 0) + 1;
    });
    return Object.entries(counts).map(([state, count]) => ({ state, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredData]);

  const handleExportCSV = () => {
    if (filteredData.length === 0) return alert("Nenhum dado para exportar.");
    
    const headers = ["ID", "Nome", "CPF", "Email", "Cidade", "Estado", "Status", "Data Cadastro"];
    const rows = filteredData.map(f => [
      f.id,
      `"${f.full_name}"`, 
      `"${f.cpf}"`, 
      `"${f.email}"`, 
      `"${f.city}"`, 
      `"${f.state_id}"`, 
      `"${f.status}"`,
      `"${new Date(f.created_at).toLocaleDateString('pt-BR')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_mobiliza_${selectedYear}_${selectedMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6 w-full text-black">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <h1 className="text-3xl font-bold tracking-tight text-white dark:text-white sm:text-black">Relatórios e Métricas</h1>
        <button onClick={handleExportCSV} className="mt-4 md:mt-0 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Download className="w-4 h-4" /> Exportar Relatório CSV
        </button>
      </div>

      {/* SEÇÃO 1 - Filtros */}
      <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border shadow-sm">
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Mês</label>
          <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded-md px-3 py-2 bg-white">
            <option value="all">Todos</option>
            {[...Array(12)].map((_, i) => (
              <option key={i+1} value={(i+1).toString()}>{new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium mb-1">Ano</label>
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded-md px-3 py-2 bg-white">
            <option value="all">Todos</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      {/* SEÇÃO 2 - KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-red-600">
          <p className="text-sm text-neutral-500 font-medium">Total Filiados (Histórico)</p>
          <p className="text-3xl font-bold">{loading ? "..." : totalOverall}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-blue-600">
          <p className="text-sm text-neutral-500 font-medium">Novos no Período</p>
          <p className="text-3xl font-bold">{novosNoPeriodo}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-orange-600">
          <p className="text-sm text-neutral-500 font-medium">Desfiliados/Rej. (Período)</p>
          <p className="text-3xl font-bold">{rejeitadosDesfiliados}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm border-l-4 border-l-green-600">
          <p className="text-sm text-neutral-500 font-medium">Taxa Aprovação (Período)</p>
          <p className="text-3xl font-bold">{taxaAprovacao}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SEÇÃO 3 - Gráfico Crescimento */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">Crescimento de Filiações</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <RechartsTooltip />
                <Bar dataKey="count" fill="#dc2626" name="Novas Filiações" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* SEÇÃO 4 - Gráfico Pizza Status */}
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <h3 className="text-lg font-bold mb-4">Distribuição por Status</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={100} dataKey="value" nameKey="name" label>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-neutral-500">Sem dados para o período</p>
            )}
          </div>
        </div>
      </div>

      {/* SEÇÃO 5 - Tabela Top Estados */}
      <div className="bg-white p-4 rounded-xl border shadow-sm">
        <h3 className="text-lg font-bold mb-4">Top 5 Estados com Mais Filiados</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Qtd. Filiados</th>
              </tr>
            </thead>
            <tbody>
              {statesData.map((s, i) => (
                <tr key={s.state} className="border-b last:border-0 hover:bg-neutral-50">
                  <td className="px-4 py-3 font-bold">{s.state}</td>
                  <td className="px-4 py-3 text-right">{s.count}</td>
                </tr>
              ))}
              {statesData.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-center text-neutral-500">Nenhum dado encontrado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
