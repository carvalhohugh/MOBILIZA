import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-black text-white py-12">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h3 className="text-xl font-bold">MOBILIZA <span className="text-red-600">33</span></h3>
          <p className="text-gray-400 text-sm">
            A voz do povo em movimento. O Mobiliza está presente em todo o Brasil, construindo um futuro melhor para todos.
          </p>
        </div>
        
        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Institucional</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/o-mobiliza" className="hover:text-white transition-colors">O Mobiliza</Link></li>
            <li><Link href="/presenca" className="hover:text-white transition-colors">Nossa Presença</Link></li>
            <li><Link href="/liderancas" className="hover:text-white transition-colors">Lideranças</Link></li>
            <li><Link href="/contato" className="hover:text-white transition-colors">Contato</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Conteúdo</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/noticias" className="hover:text-white transition-colors">Notícias</Link></li>
            <li><Link href="/eventos" className="hover:text-white transition-colors">Eventos</Link></li>
            <li><Link href="/documentos" className="hover:text-white transition-colors">Documentos</Link></li>
          </ul>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-lg">Legal</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><Link href="/privacidade" className="hover:text-white transition-colors">Privacidade</Link></li>
            <li><Link href="/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-12 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} MOBILIZA 33. Todos os direitos reservados.
      </div>
    </footer>
  );
}
