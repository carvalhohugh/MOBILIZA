"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
  
  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push("/admin")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-100 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 flex flex-col items-center border border-neutral-200">
        
        <div className="relative h-20 w-64 mb-8">
          <Image 
            src="/logo.svg" 
            alt="MOBILIZA 33" 
            fill 
            className="object-contain" 
            priority
          />
        </div>

        <h1 className="text-2xl font-bold uppercase tracking-tight text-neutral-900 mb-6">Acesso Restrito</h1>

        {error && (
          <div className="w-full bg-red-100 text-red-600 text-sm font-bold p-3 rounded-md mb-4 text-center">
            {error === 'Invalid login credentials' ? 'Usuário ou senha incorretos' : error}
          </div>
        )}

        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-500 uppercase">E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-neutral-300 rounded-md p-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              placeholder="admin@admin.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-500 uppercase">Senha</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-neutral-300 rounded-md p-3 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-red-600 text-white font-bold uppercase tracking-wider py-4 rounded-md hover:bg-neutral-900 transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 w-full text-center">
          <p className="text-sm text-neutral-500 mb-2 font-medium">Não possui cadastro?</p>
          <Link 
            href="/filie-se" 
            className="text-red-600 font-bold hover:underline"
          >
            Fazer Novo Cadastro (Filiação)
          </Link>
        </div>
      </div>
    </div>
  )
}
