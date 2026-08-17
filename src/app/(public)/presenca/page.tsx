"use client";

import { useEffect, useState } from "react";
import DynamicMap from "@/components/DynamicMap";
import { supabase } from "@/lib/supabase";

type Representation = {
  id: string;
  name: string;
  state_id: string;
  city: string;
  type: string;
  status: string;
  latitude: number | null;
  longitude: number | null;
};

export default function PresencaPage() {
  const [representations, setRepresentations] = useState<Representation[]>([]);
  const [stats, setStats] = useState({
    states: 0,
    cities: 0,
    active: 0
  });

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public-map-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'representations' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    const { data } = await supabase
      .from('representations')
      .select('*')
      .neq('status', 'INATIVA');

    if (data) {
      setRepresentations(data);
      
      const uniqueStates = new Set(data.map(r => r.state_id)).size;
      const uniqueCities = new Set(data.map(r => r.city + r.state_id)).size;
      const activeCount = data.filter(r => r.status === 'ATIVA').length;

      setStats({
        states: uniqueStates,
        cities: uniqueCities,
        active: activeCount
      });
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-80px)]">
      {/* HEADER DA PÁGINA */}
      <section className="bg-neutral-900 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
          O Mobiliza Está Presente
        </h1>
        <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto">
          Veja onde o Mobiliza 33 está construindo sua presença em todo o Brasil.
        </p>
      </section>

      {/* CONTADORES NACIONAIS */}
      <section className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <p className="text-4xl font-bold text-red-600">{stats.states}</p>
              <p className="text-sm font-semibold uppercase text-neutral-500">Estados (UFs)</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-red-600">{stats.cities}</p>
              <p className="text-sm font-semibold uppercase text-neutral-500">Municípios</p>
            </div>
            <div className="space-y-2">
              <p className="text-4xl font-bold text-red-600">{stats.active}</p>
              <p className="text-sm font-semibold uppercase text-neutral-500">Diretórios Ativos</p>
            </div>
            <div className="space-y-2 flex flex-col justify-center items-center">
              <span className="flex items-center gap-2 text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Tempo Real
              </span>
              <p className="text-xs text-neutral-400">Mapa atualizado instantaneamente</p>
            </div>
          </div>
        </div>
      </section>

      {/* MAPA */}
      <section className="flex-1 min-h-[600px] relative z-0">
        <DynamicMap representations={representations} />
      </section>
    </div>
  );
}
