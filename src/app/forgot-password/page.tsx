'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, Network, ArrowLeft, ChevronLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }
      setSent(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in group">
        <Link href="/" className="flex flex-col items-center justify-center gap-3 mb-8 hover:scale-105 transition-transform">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </Link>

        <div className="glass-panel p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            {sent ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-neon-blue/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                  <Mail className="w-10 h-10 text-neon-blue animate-pulse-slow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Revisa tu Correo</h2>
                <p className="text-dark-300 text-sm mb-8 leading-relaxed">
                  Si el correo <span className="text-white font-medium">{email}</span> está registrado, recibirás un enlace mágico para restablecer tu contraseña.
                </p>
                <Link href="/login" className="btn-secondary inline-flex items-center gap-2 group">
                  <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  Volver al Login
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Recuperar Contraseña</h2>
                <p className="text-dark-300 text-sm mb-8 text-center">Ingresa tu correo y te enviaremos un enlace de recuperación</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                    <div className="relative group/input">
                      <input
                        type="email"
                        className="input-field pl-11 bg-dark-900/50 border-dark-700 focus:border-neon-blue/50 focus:bg-dark-900/80 transition-all duration-300"
                        placeholder="tu@correo.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within/input:text-neon-blue transition-colors">
                        <Mail className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 shadow-neon-blue/20 hover:shadow-neon-blue/40">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                    ) : (
                      <>
                        Enviar Enlace
                        <Mail className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        <p className="text-center text-dark-400 text-sm mt-8">
          <Link href="/login" className="text-neon-purple hover:text-white transition-colors font-medium inline-flex items-center gap-1 group">
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
