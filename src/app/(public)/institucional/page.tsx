import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileText, Flag, Target, HeartHandshake } from "lucide-react";

export default function InstitucionalPage() {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50 pb-20">
      <div className="bg-neutral-900 py-20 px-4 text-center border-b-8 border-red-600">
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
          Manifesto <span className="text-red-500">Mobiliza 33</span>
        </h1>
        <p className="text-xl text-neutral-300 font-medium max-w-2xl mx-auto">
          Conheça as diretrizes, pilares e proposições que norteiam as ações do nosso partido na construção de um Brasil melhor.
        </p>
      </div>

      <div className="container mx-auto px-4 mt-16 max-w-5xl space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-neutral-200 pb-4">
            <div className="bg-red-600 p-3 rounded-xl text-white">
              <Flag className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold uppercase text-neutral-900 tracking-tight">O que nos move (Manifesto)</h2>
          </div>
          <div className="prose prose-lg prose-neutral max-w-none text-neutral-700 space-y-4">
            <p className="lead text-xl font-medium text-neutral-900">
              O Mobiliza 33 nasce da urgência de colocar o Brasil em movimento novamente. Acreditamos que a política deve ser um instrumento de transformação real, não um fim em si mesmo.
            </p>
            <p>
              Nós rejeitamos o extremismo cego e a inércia política. Nosso compromisso é com a prosperidade econômica, a liberdade individual, a justiça social equilibrada e a defesa inegociável da democracia. 
            </p>
            <p>
              Entendemos que o papel do Estado é servir como propulsor do desenvolvimento, garantindo saúde e educação de qualidade, mas permitindo que a livre iniciativa privada floresça sem amarras burocráticas excessivas.
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-neutral-200 pb-4">
            <div className="bg-neutral-900 p-3 rounded-xl text-white">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold uppercase text-neutral-900 tracking-tight">Nossos Pilares</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-t-4 border-t-red-600 shadow-lg">
              <CardHeader>
                <CardTitle className="uppercase font-bold text-xl">1. Liberdade Econômica</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Acreditamos que o empreendedorismo é o maior motor de ascensão social. Defendemos a redução da carga tributária e a simplificação de impostos para quem produz e gera empregos no país.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-600 shadow-lg">
              <CardHeader>
                <CardTitle className="uppercase font-bold text-xl">2. Educação Transformadora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Nenhuma nação avança sem investir massivamente na base. Nosso foco é modernizar o currículo escolar, valorizar o professor e integrar o ensino técnico às demandas do mercado de trabalho do século XXI.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-600 shadow-lg">
              <CardHeader>
                <CardTitle className="uppercase font-bold text-xl">3. Gestão Pública Eficiente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Chega de inchaço governamental. O Mobiliza defende um Estado focado no essencial, utilizando tecnologia e transparência total para combater a corrupção e entregar serviços de qualidade ao cidadão.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-red-600 shadow-lg">
              <CardHeader>
                <CardTitle className="uppercase font-bold text-xl">4. Sustentabilidade Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600">
                  Proteger nosso meio ambiente não é inimigo do agronegócio. Acreditamos na bioeconomia e no desenvolvimento de tecnologias que permitam o agro continuar crescendo enquanto preservamos nossos biomas.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-4 border-b-2 border-neutral-200 pb-4">
            <div className="bg-red-600 p-3 rounded-xl text-white">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-extrabold uppercase text-neutral-900 tracking-tight">Proposições Oficiais</h2>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-neutral-200 shadow-md">
            <p className="text-lg text-neutral-700 mb-6">
              Para acessar o documento completo do nosso programa de governo, estatuto e código de ética, faça o download dos arquivos oficiais abaixo:
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" className="gap-2 font-bold uppercase text-neutral-700 border-neutral-300 hover:text-red-600 hover:border-red-600" asChild>
                <a href="#" target="_blank"><FileText className="w-4 h-4" /> Estatuto do Partido</a>
              </Button>
              <Button variant="outline" className="gap-2 font-bold uppercase text-neutral-700 border-neutral-300 hover:text-red-600 hover:border-red-600" asChild>
                <a href="#" target="_blank"><FileText className="w-4 h-4" /> Código de Ética</a>
              </Button>
              <Button variant="outline" className="gap-2 font-bold uppercase text-neutral-700 border-neutral-300 hover:text-red-600 hover:border-red-600" asChild>
                <a href="#" target="_blank"><FileText className="w-4 h-4" /> Resolução de Diretório</a>
              </Button>
            </div>
          </div>
        </section>

        <div className="text-center pt-12 border-t border-neutral-200">
          <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-neutral-900">Faça parte do Movimento</h3>
          <Button size="lg" className="bg-red-600 hover:bg-red-700 text-white font-extrabold uppercase rounded-full px-12 py-6 text-lg shadow-xl" asChild>
            <Link href="/filie-se">Quero me Filiar</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
