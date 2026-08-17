import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white text-black">
      <div className="container flex h-24 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-16 w-56 bg-white p-2">
              <Image 
                src="/logo.svg" 
                alt="MOBILIZA 33" 
                fill 
                className="object-contain" 
                priority
              />
            </div>
          </Link>

          <nav className="hidden md:flex gap-6 text-sm font-bold uppercase tracking-wide items-center">
            <Link href="/noticias" className="hover:text-red-600 transition-colors">Notícias</Link>
            <Link href="/institucional" className="hover:text-red-600 transition-colors">Institucional</Link>
            
            {/* Dropdown Estados */}
            <div className="relative group py-4">
              <button className="flex items-center hover:text-red-600 transition-colors uppercase font-bold">
                Estados
              </button>
              <div className="absolute left-0 top-full mt-0 w-64 bg-white text-black shadow-lg border border-neutral-200 hidden group-hover:flex flex-col z-50 py-2">
                <Link href="/presenca" className="px-4 py-3 hover:bg-neutral-100 border-b">Diretórios Estaduais</Link>
                <Link href="/estados/politicos/governadores" className="px-4 py-3 hover:bg-neutral-100 border-b">Governadores</Link>
                <Link href="/estados/politicos/vice-governadores" className="px-4 py-3 hover:bg-neutral-100 border-b">Vice Governadores</Link>
                <Link href="/estados/politicos/senadores" className="px-4 py-3 hover:bg-neutral-100 border-b">Senadores</Link>
                <Link href="/estados/politicos/deputados-federais" className="px-4 py-3 hover:bg-neutral-100 border-b">Deputados Federais</Link>
                <Link href="/estados/politicos/deputados-estaduais" className="px-4 py-3 hover:bg-neutral-100 border-b">Deputados Estaduais</Link>
                <Link href="/estados/politicos/prefeituras" className="px-4 py-3 hover:bg-neutral-100 border-b">Prefeituras do Mobiliza</Link>
                <Link href="/estados/politicos/vereadores" className="px-4 py-3 hover:bg-neutral-100">Vereadores do Mobiliza</Link>
              </div>
            </div>

            <Link href="/tv" className="hover:text-red-600 transition-colors">Mobiliza TV</Link>
            <Link href="/filie-se" className="hover:text-red-600 transition-colors">Filie-se</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-semibold hover:text-red-600 flex items-center gap-2 uppercase tracking-wide">
            Área Restrita
          </Link>
          <Button size="lg" className="bg-red-600 hover:bg-neutral-900 text-white font-extrabold rounded-full px-6 py-6 flex items-center justify-center gap-2 shadow-xl border-4 border-transparent hover:border-red-600 transition-all uppercase tracking-wide" asChild>
            <Link href="/doacao" className="flex items-center gap-2">
              <span className="bg-white text-red-600 rounded-full w-6 h-6 flex items-center justify-center font-black text-[10px]">R$</span>
              <span>Faça sua Doação</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
