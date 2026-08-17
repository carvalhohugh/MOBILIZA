"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { QrCode, CheckCircle2 } from "lucide-react";

export default function DoacaoPage() {
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState<string>("");
  const [donorName, setDonorName] = useState("");
  const [donorCpf, setDonorCpf] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [pixCode, setPixCode] = useState("");

  // Simple BRL currency mask
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    if (value === "") {
      setAmount("");
      return;
    }
    const numericValue = (parseInt(value, 10) / 100).toFixed(2);
    const formatted = numericValue
      .replace(".", ",")
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
    setAmount(`R$ ${formatted}`);
  };

  const handlePredefinedClick = (val: string) => {
    setAmount(`R$ ${val},00`);
  };

  const parseAmountToNumber = (str: string) => {
    const cleanStr = str.replace("R$ ", "").replace(/\./g, "").replace(",", ".");
    return parseFloat(cleanStr);
  };

  const handleNextStep = () => {
    if (!amount || amount === "R$ 0,00") {
      alert("Por favor, informe um valor válido para doação.");
      return;
    }
    setStep(2);
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const numericAmount = parseAmountToNumber(amount);
    
    // In a real app, you would call a payment gateway (e.g., MercadoPago, Asaas, Pagar.me) here to generate a real PIX Copy/Paste string.
    // We mock it for now.
    const mockPix = `00020126580014br.gov.bcb.pix0136doacao@mobiliza33.org.br520400005303986540${numericAmount.toFixed(2)}5802BR5915MOBILIZA 336009SAO PAULO62140510DOACAO20266304`;
    
    const { error } = await supabase.from('donations').insert([
      {
        donor_name: donorName,
        donor_cpf: donorCpf,
        donor_email: donorEmail,
        amount: numericAmount,
        status: 'PENDING',
        pix_code: mockPix
      }
    ]);

    setLoading(false);
    if (error) {
      alert("Erro ao registrar intenção de doação. Tente novamente.");
      console.error(error);
      return;
    }

    setPixCode(mockPix);
    setStep(3);
  };

  const copyPix = () => {
    navigator.clipboard.writeText(pixCode);
    alert("Código PIX Copiado!");
  };

  return (
    <div className="min-h-[80vh] bg-neutral-100 flex flex-col items-center py-20 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200">
        <div className="bg-red-600 p-8 text-center text-white border-b-8 border-neutral-900">
          <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-2">Faça sua Doação</h1>
          <p className="text-red-100 text-lg font-medium">
            Contribua para a construção de um país mais forte com o Mobiliza 33.
          </p>
        </div>
        
        <div className="p-8 md:p-12 text-center space-y-8">
          
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in zoom-in duration-300">
              <p className="text-neutral-700 text-lg font-medium">
                Sua doação fortalece nossos projetos e nos ajuda a levar as ideias do Mobiliza 33 a todos os cantos do Brasil.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" onClick={() => handlePredefinedClick("50")} className="h-20 text-2xl font-bold border-2 hover:border-red-600 hover:text-red-600 hover:bg-red-50">R$ 50</Button>
                <Button variant="outline" onClick={() => handlePredefinedClick("100")} className="h-20 text-2xl font-bold border-2 hover:border-red-600 hover:text-red-600 hover:bg-red-50">R$ 100</Button>
                <Button variant="outline" onClick={() => handlePredefinedClick("500")} className="h-20 text-2xl font-bold border-2 hover:border-red-600 hover:text-red-600 hover:bg-red-50">R$ 500</Button>
                <Button variant="outline" onClick={() => setAmount("")} className="h-20 text-xl font-bold border-2 hover:border-red-600 hover:text-red-600 hover:bg-red-50">Outro Valor</Button>
              </div>

              <div className="max-w-xs mx-auto">
                <Input 
                  type="text" 
                  value={amount} 
                  onChange={handleAmountChange} 
                  placeholder="R$ 0,00" 
                  className="h-20 text-center text-4xl font-extrabold text-neutral-900 border-2 border-neutral-300 focus-visible:ring-red-600"
                />
              </div>
              
              <div className="pt-8 border-t border-neutral-200">
                <Button size="lg" onClick={handleNextStep} className="bg-red-600 hover:bg-neutral-900 text-white font-extrabold w-full md:w-auto px-16 py-8 text-2xl rounded-full shadow-lg uppercase tracking-tight transition-colors">
                  Avançar
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleGeneratePix} className="space-y-6 text-left max-w-lg mx-auto animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-neutral-100 p-4 rounded-lg flex justify-between items-center mb-6">
                <span className="font-bold text-neutral-500 uppercase text-sm">Valor Escolhido:</span>
                <span className="font-black text-2xl text-red-600">{amount}</span>
                <Button type="button" variant="link" size="sm" onClick={() => setStep(1)}>Alterar</Button>
              </div>

              <p className="text-neutral-700 text-sm mb-4">
                Por exigência da Legislação Eleitoral (TSE), precisamos identificar todos os doadores. Suas informações estão seguras.
              </p>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" required value={donorName} onChange={e => setDonorName(e.target.value)} placeholder="Seu nome completo" className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" required value={donorCpf} onChange={e => setDonorCpf(e.target.value)} placeholder="000.000.000-00" className="h-12" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail para recibo</Label>
                <Input id="email" type="email" required value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="seu@email.com" className="h-12" />
              </div>

              <div className="pt-6 border-t border-neutral-200 flex flex-col gap-3">
                <Button type="submit" disabled={loading} size="lg" className="bg-[#32bcad] hover:bg-[#208a7e] text-white font-extrabold w-full py-8 text-xl rounded-full shadow-lg uppercase tracking-tight">
                  {loading ? "Processando..." : "Gerar PIX Cópia e Cola"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep(1)} className="uppercase font-bold text-neutral-500">Voltar</Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-6 flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-neutral-900 uppercase">PIX Gerado!</h2>
              <p className="text-neutral-600 font-medium">Aguardando pagamento do valor de <strong className="text-neutral-900">{amount}</strong></p>

              <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-xl w-full max-w-md my-6 flex flex-col items-center gap-4">
                <QrCode className="w-48 h-48 text-neutral-800 opacity-20" />
                <p className="text-xs text-neutral-500 uppercase font-bold text-center">QR Code Ilustrativo (Use a chave copia e cola)</p>
              </div>

              <div className="w-full max-w-md space-y-2">
                <Label className="text-left block text-neutral-500 uppercase font-bold text-xs">PIX Cópia e Cola</Label>
                <div className="flex gap-2">
                  <Input defaultValue={pixCode} value={pixCode} readOnly className="bg-neutral-100 text-neutral-600 font-mono text-sm" />
                  <Button onClick={copyPix} className="bg-neutral-900 text-white font-bold hover:bg-neutral-800">COPIAR</Button>
                </div>
              </div>

              <p className="text-sm font-bold text-neutral-500 mt-8 uppercase pt-4 border-t w-full max-w-md">
                Chave Pix Oficial Alternativa: <br/><span className="text-red-600">doacao@mobiliza33.org.br</span>
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
