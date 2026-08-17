import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Settings, Users, FileText, LayoutTemplate, ShieldCheck } from "lucide-react";

export default function ConfiguracoesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações Gerais</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie as configurações globais da plataforma e de seus módulos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <Link href="/admin/configuracoes/filiacao" className="block group">
          <Card className="h-full border-2 border-transparent group-hover:border-red-600 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                <Users className="w-6 h-6 text-red-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-xl">Módulo de Filiação</CardTitle>
              <CardDescription>
                Configure as opções de participação, interesses, e documentos exigidos no formulário (Wizard).
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/configuracoes/sites" className="block group">
          <Card className="h-full border-2 border-transparent group-hover:border-red-600 transition-all hover:shadow-lg">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-red-600 transition-colors">
                <FileText className="w-6 h-6 text-red-600 group-hover:text-white" />
              </div>
              <CardTitle className="text-xl">Sites Confiáveis (RSS)</CardTitle>
              <CardDescription>
                Gerencie os sites fontes que a plataforma usará para a Curadoria de Notícias.
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="#" className="block group cursor-not-allowed opacity-70">
          <Card className="h-full border-2 border-transparent transition-all">
            <CardHeader>
              <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-neutral-600" />
              </div>
              <CardTitle className="text-xl">Permissões de Acesso</CardTitle>
              <CardDescription>
                Controle de nível de acesso para administradores (Em Breve).
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>

      </div>
    </div>
  );
}
