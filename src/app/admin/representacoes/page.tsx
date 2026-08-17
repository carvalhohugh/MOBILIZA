import { RepresentacoesClient } from "./RepresentacoesClient";

export default function RepresentacoesPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Gestão de Representações</h1>
      </div>
      <p className="text-muted-foreground">
        Cadastre e gerencie as representações estaduais e municipais do MOBILIZA 33.
      </p>
      
      <div className="mt-4">
        <RepresentacoesClient />
      </div>
    </div>
  );
}
