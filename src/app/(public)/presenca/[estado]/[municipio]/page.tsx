import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function MunicipioPage({ params }: { params: Promise<{ estado: string, municipio: string }> }) {
  const { estado, municipio } = await params;
  const sigla = estado.toUpperCase();
  const nomeMunicipioFormatado = municipio.replace(/-/g, ' '); // simple un-slug

  const { data: representacoes } = await supabase
    .from('representations')
    .select('*')
    .eq('state_id', sigla)
    .ilike('city', nomeMunicipioFormatado)
    .eq('type', 'MUNICIPAL')
    .neq('status', 'INATIVA');

  if (!representacoes || representacoes.length === 0) {
    return (
      <div className="container py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold uppercase">Município não encontrado</h1>
        <p className="text-neutral-500">O município informado não possui um diretório ou representação cadastrada.</p>
        <Button asChild>
          <Link href={`/presenca/${sigla.toLowerCase()}`}>Voltar para {sigla}</Link>
        </Button>
      </div>
    );
  }

  const rep = representacoes[0];

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <section className="bg-neutral-900 text-white py-16 px-4 text-center border-b-4 border-red-600">
        <h1 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">
          {rep.name}
        </h1>
        <p className="text-lg md:text-xl text-neutral-400">
          Representação Municipal — {rep.city} / {rep.state_id}
        </p>
      </section>

      <div className="container max-w-3xl mt-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
          <div className="flex items-center justify-between mb-8 pb-4 border-b">
            <h2 className="text-2xl font-bold">Informações Institucionais</h2>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase
              ${rep.status === 'ATIVA' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              Status: {rep.status}
            </span>
          </div>

          <div className="space-y-4 text-lg">
            <p><strong>Cidade:</strong> {rep.city}</p>
            <p><strong>Estado:</strong> {rep.state_id}</p>
            <p><strong>Tipo:</strong> Diretório Municipal</p>
            {rep.address && <p><strong>Endereço Sede:</strong> {rep.address}</p>}
            {rep.email && <p><strong>E-mail Institucional:</strong> {rep.email}</p>}
            {rep.phone && <p><strong>Telefone:</strong> {rep.phone}</p>}
          </div>

          <div className="mt-12 flex justify-center">
            <Button className="bg-red-600 hover:bg-red-700 px-8" size="lg">
              ENTRAR EM CONTATO COM O DIRETÓRIO
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
