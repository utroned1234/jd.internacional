'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Lock, Network, Eye, EyeOff, Check, ChevronRight } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" /></div>}>
      <ResetForm />
    </Suspense>
  )
}

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, ...form }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }
      setSuccess(true)
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10 animate-fade-in group">
        <Link href="/" className="flex flex-col items-center justify-center gap-3 mb-8 hover:scale-105 transition-transform">
          <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
        </Link>

        <div className="glass-panel p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />
          <div className="relative z-10">
            {success ? (
              <div className="text-center py-4">
                <div className="w-20 h-20 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(0,255,157,0.2)]">
                  <Check className="w-10 h-10 text-neon-green animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Contraseña Actualizada</h2>
                <p className="text-dark-300 text-sm mb-8">Tu contraseña ha sido restablecida exitosamente.</p>
                <Link href="/login" className="btn-primary inline-flex items-center gap-2 w-full justify-center">
                  Iniciar Sesión
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-2 text-center">Nueva Contraseña</h2>
                <p className="text-dark-300 text-sm mb-8 text-center">Ingresa tu nueva contraseña para acceder</p>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Nueva Contraseña</label>
                    <div className="relative group/input">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="input-field pr-12 bg-dark-900/50 border-dark-700 focus:border-neon-purple/50 focus:bg-dark-900/80 transition-all duration-300"
                        placeholder="Min. 8 caracteres"
                        value={form.password}
                        onChange={e => setForm({ ...form, password: e.target.value })}
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Confirmar Contraseña</label>
                    <input
                      type="password"
                      className="input-field bg-dark-900/50 border-dark-700 focus:border-neon-purple/50 focus:bg-dark-900/80 transition-all duration-300"
                      placeholder="Repite tu contraseña"
                      value={form.confirmPassword}
                      onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 shadow-neon-blue/20 hover:shadow-neon-blue/40 mt-4">
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                    ) : (
                      <>
                        Restablecer Contraseña
                        <Lock className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
