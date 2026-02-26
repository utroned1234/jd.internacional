'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, LogIn, Network, User, Mail, ChevronRight } from 'lucide-react'

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

      if (!res.ok) {
        setError(data.error)
        return
      }

      router.refresh()
      router.push('/dashboard')
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const isEmail = form.identifier.includes('@')

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-neon-purple/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in group">
        {/* Logo */}
        <Link href="/" className="flex flex-col items-center justify-center gap-6 mb-4">
          <img src="/logo.png" alt="Logo" className="w-32 h-32 object-contain group-hover:scale-110 transition-transform duration-500" />
        </Link>
        <h2 className="text-3xl font-black text-center text-white mb-1 tracking-tight">Bienvenido a JD INTERNACIONAL</h2>
        <p className="text-dark-300 text-center mb-8">El futuro del Network Marketing</p>

        <div className="glass-panel p-8 md:p-10 shadow-[0_20px_40px_rgba(0,0,0,0.4)] border-white/5 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl pointer-events-none" />

          <div className="relative z-10">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <LogIn className="w-5 h-5 text-neon-blue" />
              Iniciar Sesión
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm flex items-center gap-2 animate-shake">
                <div className="w-2 h-2 rounded-full bg-red-500 blink" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wider">
                  Usuario o Correo
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    className="input-field pl-11 bg-dark-900/50 border-dark-700 focus:border-neon-blue/50 focus:bg-dark-900/80 transition-all duration-300"
                    placeholder="usuario o correo@ejemplo.com"
                    value={form.identifier}
                    onChange={e => setForm({ ...form, identifier: e.target.value })}
                    required
                    autoComplete="username"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within/input:text-neon-blue transition-colors">
                    {isEmail
                      ? <Mail className="w-5 h-5" />
                      : <User className="w-5 h-5" />
                    }
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wider">Contraseña</label>
                <div className="relative group/input">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input-field pl-4 pr-12 bg-dark-900/50 border-dark-700 focus:border-neon-purple/50 focus:bg-dark-900/80 transition-all duration-300"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-white transition-colors p-1"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-xs text-neon-blue hover:text-neon-purple transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(0,243,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)]">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
                ) : (
                  <>
                    Ingresar al Sistema
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-dark-400 text-sm mt-8">
          ¿Aún no eres miembro?{' '}
          <Link href="/register" className="text-neon-purple hover:text-neon-pink transition-colors font-bold tracking-wide">
            REGÍSTRATE AHORA
          </Link>
        </p>
      </div>
    </div>
  )
}
