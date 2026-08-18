"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ filiations: 0, news: 0, directories: 0, sources: 0 });

  useEffect(() => {
    async function loadStats() {
      const [filiations, news, directories, sources] = await Promise.all([
        supabase.from("filiations").select("*", { count: "exact", head: true }),
        supabase.from("news").select("*", { count: "exact", head: true }),
        supabase.from("directories").select("*", { count: "exact", head: true }),
        supabase.from("trusted_sources").select("*", { count: "exact", head: true })
      ]);

      setStats({
        filiations: filiations.count || 0,
        news: news.count || 0,
        directories: directories.count || 0,
        sources: sources.count || 0
      });
    }
    loadStats();
  }, []);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard Administrativo</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Filiações Totais</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.filiations}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Notícias Publicadas</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.news}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Diretórios Ativos</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.directories}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Fontes de Curadoria</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{stats.sources}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
