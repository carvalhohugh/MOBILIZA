import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function EstadoPage({ params }: { params: Promise<{ estado: string }> }) {
  const { estado } = await params;
  const sigla = estado.toUpperCase();
  
  const { data: representacoes } = await supabase
    .from('representations')
    .select('*')
    .eq('state_id', sigla)
    .neq('status', 'INATIVA');

  if (!representacoes || representacoes.length === 0) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase">Estado não encontrado</h1>
        <p className="text-neutral-500">O estado informado não possui representações cadastradas no momento.</p>
        <Button asChild>
          <Link href="/presenca">Voltar para o Mapa Nacional</Link>
        </Button>
      </div>
    );
  }

  const estaduais = representacoes.filter(r => r.type === 'ESTADUAL');
  const municipais = representacoes.filter(r => r.type === 'MUNICIPAL');

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <section className="bg-red-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight mb-4">
          MOBILIZA {sigla}
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
          Nossa representação e presença no estado.
        </p>
      </section>

      <div className="container mt-8 grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Diretório Estadual</h2>
          {estaduais.length > 0 ? (
            estaduais.map(rep => (
              <div key={rep.id} className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
                <h3 className="font-bold text-xl text-neutral-900">{rep.name}</h3>
                <p className="text-neutral-500 mb-4">{rep.city} - {rep.state_id}</p>
                <div className="space-y-2 text-sm text-neutral-600">
                  <p><strong>Status:</strong> {rep.status}</p>
                  {rep.address && <p><strong>Endereço:</strong> {rep.address}</p>}
                </div>
              </div>
            ))
          ) : (
            <p className="text-neutral-500 italic">Nenhum diretório estadual cadastrado.</p>
          )}
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold border-b pb-2">Diretórios Municipais</h2>
          {municipais.length > 0 ? (
            <div className="grid gap-4">
              {municipais.map(rep => (
                <Link href={`/presenca/${sigla.toLowerCase()}/${rep.city.toLowerCase().replace(/\\s+/g, '-')}`} key={rep.id}>
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-red-600 transition-colors cursor-pointer group">
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-red-600 transition-colors">{rep.name}</h3>
                    <p className="text-sm text-neutral-500">{rep.city}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 italic">Nenhum diretório municipal cadastrado neste estado.</p>
          )}
        </div>
      </div>
    </div>
  );
}
