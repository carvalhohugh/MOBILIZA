import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PoliticosPorCargoPage({ params }: { params: Promise<{ cargo: string }> }) {
  const { cargo } = await params;
  
  // Transformar slug da URL no formato legível do banco (Ex: "deputados-estaduais" -> "Deputado Estadual")
  const roleMapping: Record<string, string> = {
    'governadores': 'Governador',
    'vice-governadores': 'Vice Governador',
    'senadores': 'Senador',
    'deputados-federais': 'Deputado Federal',
    'deputados-estaduais': 'Deputado Estadual',
    'prefeituras': 'Prefeito',
    'vereadores': 'Vereador'
  };

  const dbRole = roleMapping[cargo.toLowerCase()];

  if (!dbRole) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase">Cargo não encontrado</h1>
        <Button asChild><Link href="/">Voltar ao Início</Link></Button>
      </div>
    );
  }

  const { data: politicos } = await supabase
    .from('politicians')
    .select('*')
    .eq('role', dbRole)
    .neq('status', 'INATIVO')
    .order('name');

  const tituloPaginacao = cargo.replace(/-/g, ' ').toUpperCase();

  return (
    <main className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Banner Superior Estilo PL */}
      <section className="bg-red-600 text-white py-16 px-4 text-center border-b-[8px] border-neutral-900">
        <div className="container flex flex-col items-center gap-4">
          <div className="bg-white/10 p-4 rounded-full">
            <span className="text-4xl">👥</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
            {tituloPaginacao}
          </h1>
          <p className="text-lg text-red-100">
            Conheça os representantes do MOBILIZA 33
          </p>
        </div>
      </section>

      <div className="container mt-12 mb-20">
        {(!politicos || politicos.length === 0) ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-neutral-100">
            <p className="text-neutral-500 text-lg">Nenhum {dbRole.toLowerCase()} cadastrado até o momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {politicos.map((pol) => (
              <div key={pol.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-neutral-200 group hover:border-red-600 transition-colors">
                <div className="aspect-[4/5] bg-neutral-200 relative overflow-hidden">
                  {pol.photo_url ? (
                    <div className="absolute inset-0 bg-cover bg-top group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url(${pol.photo_url})` }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400">Sem Foto</div>
                  )}
                  {pol.last_election_votes && (
                    <div className="absolute top-4 right-4 bg-neutral-900 text-white font-black px-3 py-1 rounded text-sm shadow-md">
                      {pol.last_election_votes.toLocaleString('pt-BR')} Votos
                    </div>
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="font-bold text-xl text-neutral-900 mb-1 leading-tight">{pol.name}</h3>
                  <p className="text-red-600 text-sm font-bold uppercase tracking-wider mb-4">
                    {pol.role} {pol.city ? `- ${pol.city}` : ''}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
