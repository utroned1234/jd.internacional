'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ identifier: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      router.refresh()
      router.push('/dashboard')
    } catch {
      setError('Error de conexión. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">

      {/* Orbes */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-cyan-500/8 blur-[130px]" />
        <div className="absolute -bottom-40 -right-40 w-[450px] h-[450px] rounded-full bg-purple-600/8 blur-[130px]" />
      </div>

      <div className="w-full max-w-[340px] relative z-10">

        {/* Logo + Brand */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 mb-3 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-black/50">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-base font-black tracking-widest text-white uppercase">JD Internacional</h1>
          <p className="text-[11px] text-white/30 mt-0.5 tracking-wide">Network Marketing Digital</p>
        </div>

        {/* Card */}
        <div className="water-glass shadow-2xl shadow-black/60" style={{ padding: '1.5rem' }}>

          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-4">Iniciar sesión</p>

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5 mb-4">
              <AlertCircle size={12} className="text-red-400 shrink-0" />
              <p className="text-[11px] text-red-400 leading-snug">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">

            {/* Usuario o correo */}
            <div>
              <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1.5">
                Usuario o Correo
              </label>
              <input
                type="text"
                placeholder="usuario o correo@ejemplo.com"
                value={form.identifier}
                onChange={e => setForm({ ...form, identifier: e.target.value })}
                required
                autoComplete="username"
                autoFocus
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 transition-colors"
              />
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Contraseña
                </label>
                <Link href="/forgot-password" className="text-[10px] text-cyan-400/70 hover:text-cyan-300 transition-colors">
                  ¿Olvidaste?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/15 transition-colors pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-60 mt-1"
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #7c3aed)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.12)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.25)',
              }}
            >
              {loading
                ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                : <><span>Ingresar</span><ArrowRight size={13} /></>
              }
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white/25 text-[11px] mt-5">
          ¿Sin cuenta?{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
            Registrarse
          </Link>
        </p>

      </div>
    </div>
  )
}
