"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { Check, ChevronRight, ChevronLeft, Building, Users, AlertCircle, FileText, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function FilieSeWizard() {
  const [step, setStep] = useState(1);
  const totalSteps = 9;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Dynamic Data from DB
  const [participationOptions, setParticipationOptions] = useState<any[]>([]);
  const [interestOptions, setInterestOptions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  // Form State
  const [protocol, setProtocol] = useState("");
  const [formData, setFormData] = useState({
    // Step 1: Identificação
    fullName: "", cpf: "", birthDate: "", motherName: "", 
    // Step 2: Dados Eleitorais
    voterId: "", zone: "", section: "",
    // Step 3: Contato
    email: "", phone: "",
    // Step 4: Endereço
    zipcode: "", address: "", number: "", city: "", state: "",
    // Step 5: Participação
    participations: [] as string[],
    // Step 6: Interesses
    interests: [] as string[],
    // Step 7/8: Docs & Agreements
    acceptedDocs: [] as string[],
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    setFetching(true);
    const [partRes, intRes, docRes] = await Promise.all([
      supabase.from('membership_participation').select('*').eq('is_active', true),
      supabase.from('membership_interests').select('*').eq('is_active', true),
      supabase.from('membership_documents').select('*').eq('is_active', true)
    ]);
    
    if (partRes.data) setParticipationOptions(partRes.data);
    if (intRes.data) setInterestOptions(intRes.data);
    if (docRes.data) setDocuments(docRes.data);
    
    // Create Protocol if new
    const newProtocol = `MOB-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
    setProtocol(newProtocol);
    
    setFetching(false);
  }

  // Auto-save Mock
  useEffect(() => {
    if (step > 1 && protocol) {
      // In a real app we'd upsert to 'filiations' with status 'RASCUNHO'
      console.log("Auto-saving step", step, "for protocol", protocol);
    }
  }, [step, formData]);

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const toggleArray = (array: string[], item: string, key: string) => {
    if (array.includes(item)) {
      setFormData({ ...formData, [key]: array.filter(i => i !== item) });
    } else {
      setFormData({ ...formData, [key]: [...array, item] });
    }
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const rawCep = value.replace(/\D/g, "");
    
    // Auto-format CEP
    let formattedCep = rawCep;
    if (rawCep.length > 5) {
      formattedCep = `${rawCep.slice(0, 5)}-${rawCep.slice(5, 8)}`;
    }
    
    setFormData(prev => ({ ...prev, zipcode: formattedCep }));
    
    if (rawCep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${rawCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            address: data.logradouro || prev.address,
            city: data.localidade || prev.city,
            state: data.uf || prev.state
          }));
        }
      } catch (err) {
        console.error("Erro ao buscar CEP", err);
      }
    }
  };


  const handleFinalSubmit = async () => {
    setLoading(true);
    // Submit to DB
    const { error } = await supabase.from('filiations').insert([{
      full_name: formData.fullName,
      cpf: formData.cpf,
      email: formData.email,
      whatsapp: formData.phone,
      city: formData.city,
      state_id: formData.state,
      protocol: protocol,
      current_step: 9,
      status: 'PENDENTE',
      participation_options: formData.participations,
      interests: formData.interests,
      accepted_documents: formData.acceptedDocs
    }]);

    setLoading(false);
    if (error) {
      alert("Erro ao enviar: " + error.message);
    } else {
      setStep(10); // Success Step
    }
  };

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Carregando formulário seguro...</div>;

  const progressPercentage = ((step - 1) / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-neutral-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {step < 10 && (
          <div className="mb-8">
            <h1 className="text-3xl font-black uppercase text-neutral-900 tracking-tight text-center mb-4">
              Filiação Mobiliza 33
            </h1>
            <div className="bg-white p-4 rounded-xl shadow-sm border mb-4 flex items-center justify-between">
              <span className="font-bold text-neutral-500 uppercase text-xs">Etapa {step} de {totalSteps}</span>
              <span className="font-bold text-red-600 text-sm">{Math.round(progressPercentage)}% Concluído</span>
            </div>
            <Progress value={progressPercentage} className="h-2 bg-neutral-200" indicatorClassName="bg-red-600" />
            <div className="flex justify-end mt-2">
              <span className="text-xs text-neutral-400 font-medium">Protocolo: {protocol} (Auto-salvamento ativo)</span>
            </div>
          </div>
        )}

        <Card className="shadow-2xl border-t-8 border-t-red-600">
          <CardContent className="p-8 md:p-12">
            
            {/* STEP 1: Identificação */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">1. Identificação</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nome Completo *</Label>
                    <Input value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Seu nome completo" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF *</Label>
                    <Input value={formData.cpf} onChange={e => setFormData({...formData, cpf: e.target.value})} placeholder="000.000.000-00" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Data de Nascimento *</Label>
                    <Input type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Nome da Mãe *</Label>
                    <Input value={formData.motherName} onChange={e => setFormData({...formData, motherName: e.target.value})} placeholder="Nome completo da mãe" className="h-12" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Dados Eleitorais */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">2. Dados Eleitorais</h2>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 flex gap-4 text-blue-800 mb-6">
                  <AlertCircle className="w-6 h-6 flex-shrink-0" />
                  <p className="text-sm font-medium">Informe seus dados eleitorais exatamente como constam no seu e-Título ou Título físico.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-3">
                    <Label>Número do Título de Eleitor *</Label>
                    <Input value={formData.voterId} onChange={e => setFormData({...formData, voterId: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Zona Eleitoral *</Label>
                    <Input value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Seção *</Label>
                    <Input value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} className="h-12" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Contato */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">3. Contato</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <Label>E-mail *</Label>
                    <Input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="seu@email.com" className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Celular / WhatsApp *</Label>
                    <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="(00) 00000-0000" className="h-12" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Endereço */}
            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">4. Endereço</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2 md:col-span-3">
                    <Label>CEP *</Label>
                    <Input value={formData.zipcode} onChange={handleCepChange} maxLength={9} placeholder="00000-000" className="h-12 max-w-xs" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Logradouro / Rua *</Label>
                    <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Número *</Label>
                    <Input value={formData.number} onChange={e => setFormData({...formData, number: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Cidade *</Label>
                    <Input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado (UF) *</Label>
                    <Input value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} maxLength={2} placeholder="GO" className="h-12" />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: Participação */}
            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">5. Como você gostaria de participar?</h2>
                <p className="text-muted-foreground">Selecione uma ou mais opções geradas dinamicamente pelo painel.</p>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  {participationOptions.map(opt => (
                    <div 
                      key={opt.id} 
                      onClick={() => toggleArray(formData.participations, opt.name, 'participations')}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.participations.includes(opt.name) ? 'border-red-600 bg-red-50' : 'border-neutral-200 hover:border-neutral-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded flex items-center justify-center ${formData.participations.includes(opt.name) ? 'bg-red-600 text-white' : 'bg-neutral-200 text-transparent'}`}>
                          <Check className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900">{opt.name}</h4>
                          {opt.description && <p className="text-xs text-neutral-500 mt-1">{opt.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 6: Interesses */}
            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">6. Áreas de Interesse</h2>
                <p className="text-muted-foreground">Quais pautas você domina ou tem interesse em contribuir?</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  {interestOptions.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => toggleArray(formData.interests, opt.name, 'interests')}
                      className={`px-6 py-3 rounded-full font-bold text-sm transition-colors border-2 ${formData.interests.includes(opt.name) ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'}`}
                    >
                      {opt.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: Documentos Pessoais (Upload Placeholder) */}
            {step === 7 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">7. Documentos</h2>
                <p className="text-muted-foreground">Opcional nesta etapa. Faça upload de documento com foto.</p>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-12 flex flex-col items-center justify-center text-center hover:bg-neutral-50 transition-colors cursor-pointer">
                  <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-neutral-900 text-lg">Clique ou arraste arquivos aqui</h3>
                  <p className="text-neutral-500 mt-2 text-sm">JPG, PNG ou PDF (Max 5MB)</p>
                </div>
              </div>
            )}

            {/* STEP 8: Declarações e Aceite */}
            {step === 8 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">8. Declarações e Aceite</h2>
                <p className="text-muted-foreground">Para prosseguir, você precisa ler e aceitar os documentos institucionais abaixo definidos pelo partido.</p>
                <div className="space-y-4 mt-6">
                  {documents.map(doc => (
                    <div key={doc.id} className="bg-neutral-50 border border-neutral-200 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-lg text-neutral-900">{doc.title}</h4>
                        <p className="text-sm text-neutral-500 mb-4 md:mb-0">A leitura é {doc.is_required ? 'obrigatória' : 'recomendada'}.</p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <Button variant="outline" className="w-full sm:w-auto uppercase font-bold text-xs" asChild>
                          <a href={doc.url} target="_blank"><FileText className="w-4 h-4 mr-2" /> {doc.button_text || 'Ler'}</a>
                        </Button>
                        <div 
                          onClick={() => toggleArray(formData.acceptedDocs, doc.id, 'acceptedDocs')}
                          className={`cursor-pointer px-4 py-2 rounded font-bold text-sm uppercase transition-colors flex items-center gap-2 ${formData.acceptedDocs.includes(doc.id) ? 'bg-green-100 text-green-800' : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'}`}
                        >
                          <div className={`w-4 h-4 rounded-sm border flex items-center justify-center ${formData.acceptedDocs.includes(doc.id) ? 'bg-green-600 border-green-600 text-white' : 'border-neutral-400'}`}>
                            {formData.acceptedDocs.includes(doc.id) && <Check className="w-3 h-3" />}
                          </div>
                          Aceito
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 9: Revisão */}
            {step === 9 && (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
                <h2 className="text-2xl font-bold uppercase border-b pb-4">9. Revisão Final</h2>
                <div className="bg-red-50 text-red-800 p-4 rounded-lg border border-red-200 mb-6">
                  Por favor, revise atentamente os dados antes de finalizar sua solicitação.
                </div>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="font-bold uppercase text-neutral-500 text-sm mb-2 flex justify-between">
                      Dados Pessoais <span className="text-blue-600 cursor-pointer" onClick={()=>setStep(1)}>Editar</span>
                    </h3>
                    <p className="font-bold text-lg">{formData.fullName || 'Não informado'}</p>
                    <p className="text-neutral-600">CPF: {formData.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-neutral-500 text-sm mb-2 flex justify-between">
                      Contato <span className="text-blue-600 cursor-pointer" onClick={()=>setStep(3)}>Editar</span>
                    </h3>
                    <p className="font-bold">{formData.email}</p>
                    <p className="text-neutral-600">{formData.phone}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-neutral-500 text-sm mb-2 flex justify-between">
                      Endereço <span className="text-blue-600 cursor-pointer" onClick={()=>setStep(4)}>Editar</span>
                    </h3>
                    <p className="font-bold">{formData.city} - {formData.state}</p>
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-neutral-500 text-sm mb-2 flex justify-between">
                      Opções <span className="text-blue-600 cursor-pointer" onClick={()=>setStep(5)}>Editar</span>
                    </h3>
                    <p className="font-bold">{formData.participations.length} participações, {formData.interests.length} áreas.</p>
                  </div>
                </div>
              </div>
            )}

            {/* SUCCESS / CONCLUSÃO */}
            {step === 10 && (
              <div className="py-12 flex flex-col items-center text-center animate-in zoom-in duration-500">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                  <Check className="w-12 h-12" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tight text-neutral-900 mb-4">Solicitação Enviada!</h1>
                <p className="text-xl text-neutral-600 mb-8 max-w-lg">
                  Sua ficha de filiação foi encaminhada para análise do diretório responsável. 
                </p>
                <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-8 max-w-sm w-full">
                  <p className="text-sm font-bold uppercase text-neutral-500 mb-2">Guarde seu Protocolo</p>
                  <p className="text-3xl font-mono font-black text-red-600">{protocol}</p>
                </div>
              </div>
            )}

            {/* NAVIGATION BUTTONS */}
            {step < 10 && (
              <div className={`mt-12 pt-6 border-t flex items-center ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                {step > 1 && (
                  <Button variant="ghost" onClick={handlePrev} className="font-bold uppercase tracking-wide text-neutral-500">
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                )}
                
                {step < totalSteps ? (
                  <Button size="lg" onClick={handleNext} className="bg-neutral-900 hover:bg-red-600 text-white font-black uppercase tracking-wide rounded-full px-8 transition-colors">
                    Avançar <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleFinalSubmit} disabled={loading} className="bg-green-600 hover:bg-green-700 text-white font-black uppercase tracking-wide rounded-full px-12 transition-colors shadow-lg shadow-green-600/30">
                    {loading ? "Enviando..." : "Finalizar Solicitação"} <Check className="w-5 h-5 ml-2" />
                  </Button>
                )}
              </div>
            )}

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
