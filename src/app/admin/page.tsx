"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ChevronRight, X, Edit, Ban, Lock, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState({ filiations: [] as any[], news: [] as any[], directories: [] as any[], sources: [] as any[] });
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [filiations, news, directories, sources] = await Promise.all([
        supabase.from("filiations").select("*").order('created_at', { ascending: false }),
        supabase.from("news").select("*").order('created_at', { ascending: false }),
        supabase.from("directories").select("*").order('created_at', { ascending: false }),
        supabase.from("trusted_sources").select("*").order('created_at', { ascending: false })
      ]);

      setData({
        filiations: filiations.data || [],
        news: news.data || [],
        directories: directories.data || [],
        sources: sources.data || []
      });
      setLoading(false);
    }
    loadData();
  }, []);

  const openModal = (type: string) => setModalType(type);
  const closeModal = () => setModalType(null);

  return (
    <div className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 text-black">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold tracking-tight text-white dark:text-white sm:text-black">Dashboard Administrativo</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {/* Cards */}
        <div 
          onClick={() => openModal('filiations')}
          className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:border-red-600 transition-colors group relative overflow-hidden bg-white"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Filiações Totais</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{loading ? "..." : data.filiations.length}</div>
          </div>
        </div>

        <div 
          onClick={() => openModal('news')}
          className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:border-red-600 transition-colors group relative overflow-hidden bg-white"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Notícias Publicadas</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{loading ? "..." : data.news.length}</div>
          </div>
        </div>

        <div 
          onClick={() => openModal('directories')}
          className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:border-red-600 transition-colors group relative overflow-hidden bg-white"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Diretórios Ativos</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{loading ? "..." : data.directories.length}</div>
          </div>
        </div>

        <div 
          onClick={() => openModal('sources')}
          className="rounded-xl border bg-card text-card-foreground shadow cursor-pointer hover:border-red-600 transition-colors group relative overflow-hidden bg-white"
        >
          <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Fontes de Curadoria</h3>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-red-600 transition-colors" />
          </div>
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">{loading ? "..." : data.sources.length}</div>
          </div>
        </div>
      </div>

      {/* Tailwind Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-bold text-black">
                {modalType === 'filiations' && "Lista de Filiações"}
                {modalType === 'news' && "Lista de Notícias"}
                {modalType === 'directories' && "Lista de Diretórios"}
                {modalType === 'sources' && "Fontes de Curadoria"}
              </h2>
              <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded-full text-black">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1 text-black">
              {modalType === 'filiations' && (
                <div className="space-y-4">
                  {data.filiations.map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-neutral-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-bold">{item.full_name}</p>
                        <p className="text-sm text-neutral-600">CPF: {item.cpf} | {item.city} - {item.state_id}</p>
                        <p className="text-xs text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.status === 'APROVADO' ? 'bg-green-100 text-green-800' : item.status === 'REJEITADO' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{item.status}</span>
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => alert('Editar ' + item.full_name)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => alert('Suspender ' + item.full_name)} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-md" title="Suspender"><Ban className="w-4 h-4" /></button>
                          <button onClick={() => alert('Bloquear ' + item.full_name)} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md" title="Bloquear"><Lock className="w-4 h-4" /></button>
                          <button onClick={() => alert('Excluir ' + item.full_name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.filiations.length === 0 && <p className="text-neutral-500">Nenhum registro.</p>}
                </div>
              )}
              {modalType === 'news' && (
                <div className="space-y-4">
                  {data.news.map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-neutral-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-bold">{item.title}</p>
                        <p className="text-sm text-neutral-600">Autor: {item.author || 'N/A'}</p>
                        <p className="text-xs text-neutral-500">{new Date(item.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => alert('Editar ' + item.title)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Editar"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => alert('Suspender ' + item.title)} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-md" title="Suspender"><Ban className="w-4 h-4" /></button>
                        <button onClick={() => alert('Bloquear ' + item.title)} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md" title="Bloquear"><Lock className="w-4 h-4" /></button>
                        <button onClick={() => alert('Excluir ' + item.title)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {data.news.length === 0 && <p className="text-neutral-500">Nenhum registro.</p>}
                </div>
              )}
              {modalType === 'directories' && (
                <div className="space-y-4">
                  {data.directories.map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-neutral-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-neutral-600">{item.city} - {item.state}</p>
                        <p className="text-xs text-neutral-500">Tipo: {item.type}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => alert('Editar ' + item.name)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Editar"><Edit className="w-4 h-4" /></button>
                        <button onClick={() => alert('Suspender ' + item.name)} className="p-1.5 text-orange-600 hover:bg-orange-100 rounded-md" title="Suspender"><Ban className="w-4 h-4" /></button>
                        <button onClick={() => alert('Bloquear ' + item.name)} className="p-1.5 text-neutral-600 hover:bg-neutral-100 rounded-md" title="Bloquear"><Lock className="w-4 h-4" /></button>
                        <button onClick={() => alert('Excluir ' + item.name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                  {data.directories.length === 0 && <p className="text-neutral-500">Nenhum registro.</p>}
                </div>
              )}
              {modalType === 'sources' && (
                <div className="space-y-4">
                  {data.sources.map((item: any) => (
                    <div key={item.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-neutral-50 transition-colors">
                      <div className="flex-1">
                        <p className="font-bold">{item.name}</p>
                        <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">{item.url}</a>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{item.status}</span>
                        <div className="flex gap-1 mt-2">
                          <button onClick={() => alert('Editar ' + item.name)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md" title="Editar"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => alert('Excluir ' + item.name)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-md" title="Excluir"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {data.sources.length === 0 && <p className="text-neutral-500">Nenhum registro.</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
