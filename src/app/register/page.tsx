'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, UserPlus, ChevronRight, ChevronDown } from 'lucide-react'

const LATAM_DATA: Record<string, string[]> = {
  'Argentina': ['Buenos Aires', 'Cordoba', 'Rosario', 'Mendoza', 'La Plata', 'Tucuman', 'Mar del Plata', 'Salta', 'Santa Fe', 'San Juan'],
  'Bolivia': ['La Paz', 'Santa Cruz de la Sierra', 'Cochabamba', 'Sucre', 'Oruro', 'Potosi', 'Tarija', 'Beni', 'Trinidad', 'Cobija'],
  'Brasil': ['Sao Paulo', 'Rio de Janeiro', 'Brasilia', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre'],
  'Chile': ['Santiago', 'Valparaiso', 'Concepcion', 'La Serena', 'Antofagasta', 'Temuco', 'Rancagua', 'Talca', 'Arica', 'Iquique'],
  'Colombia': ['Bogota', 'Medellin', 'Cali', 'Barranquilla', 'Cartagena', 'Cucuta', 'Bucaramanga', 'Pereira', 'Santa Marta', 'Manizales'],
  'Costa Rica': ['San Jose', 'Alajuela', 'Cartago', 'Heredia', 'Liberia', 'Puntarenas', 'Limon', 'Nicoya', 'San Carlos', 'Desamparados'],
  'Cuba': ['La Habana', 'Santiago de Cuba', 'Camaguey', 'Holguin', 'Santa Clara', 'Guantanamo', 'Bayamo', 'Las Tunas', 'Matanzas', 'Cienfuegos'],
  'Ecuador': ['Quito', 'Guayaquil', 'Cuenca', 'Ambato', 'Portoviejo', 'Machala', 'Loja', 'Riobamba', 'Esmeraldas', 'Ibarra'],
  'El Salvador': ['San Salvador', 'Santa Ana', 'San Miguel', 'Soyapango', 'Mejicanos', 'Apopa', 'Delgado', 'Sonsonate', 'Usulutan', 'Ahuachapan'],
  'Guatemala': ['Ciudad de Guatemala', 'Mixco', 'Villa Nueva', 'Quetzaltenango', 'Escuintla', 'Chinautla', 'San Juan Sacatepequez', 'Petapa', 'Amatitlan', 'Coban'],
  'Honduras': ['Tegucigalpa', 'San Pedro Sula', 'Choloma', 'La Ceiba', 'El Progreso', 'Juticalpa', 'Danli', 'Choluteca', 'Comayagua', 'Puerto Cortes'],
  'Mexico': ['Ciudad de Mexico', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'Ciudad Juarez', 'Leon', 'Zapopan', 'Ecatepec', 'Nezahualcoyotl'],
  'Nicaragua': ['Managua', 'Leon', 'Masaya', 'Granada', 'Matagalpa', 'Chinandega', 'Estelil', 'Jinotega', 'Nueva Guinea', 'Juigalpa'],
  'Panama': ['Ciudad de Panama', 'San Miguelito', 'Colon', 'David', 'La Chorrera', 'Tocumen', 'Arraijan', 'Penonome', 'Santiago', 'Chitre'],
  'Paraguay': ['Asuncion', 'Ciudad del Este', 'San Lorenzo', 'Luque', 'Capiata', 'Lambare', 'Fernando de la Mora', 'Limpio', 'Encarnacion', 'Pedro Juan Caballero'],
  'Peru': ['Lima', 'Arequipa', 'Trujillo', 'Chiclayo', 'Piura', 'Iquitos', 'Cusco', 'Chimbote', 'Huancayo', 'Tacna'],
  'Puerto Rico': ['San Juan', 'Bayamon', 'Carolina', 'Ponce', 'Caguas', 'Guaynabo', 'Arecibo', 'Toa Baja', 'Mayaguez', 'Trujillo Alto'],
  'Republica Dominicana': ['Santo Domingo', 'Santiago de los Caballeros', 'San Pedro de Macoris', 'La Romana', 'San Cristobal', 'Puerto Plata', 'Higui', 'San Francisco de Macoris', 'Moca', 'Barahona'],
  'Uruguay': ['Montevideo', 'Salto', 'Ciudad de la Costa', 'Paysandu', 'Las Piedras', 'Rivera', 'Maldonado', 'Tacuarembo', 'Melo', 'Mercedes'],
  'Venezuela': ['Caracas', 'Maracaibo', 'Valencia', 'Barquisimeto', 'Maracay', 'Ciudad Guayana', 'Barcelona', 'Maturin', 'San Cristobal', 'Cumaná'],
}

const COUNTRIES = Object.keys(LATAM_DATA).sort()

interface FormData {
  referralCode: string
  username: string
  fullName: string
  country: string
  city: string
  identityDocument: string
  dateOfBirth: string
  email: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  )
}

interface SuccessData {
  fullName: string
  username: string
  password: string
  referralCode: string
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [cities, setCities] = useState<string[]>([])
  const [refLocked, setRefLocked] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  const [form, setForm] = useState<FormData>({
    referralCode: '',
    username: '',
    fullName: '',
    country: '',
    city: '',
    identityDocument: '',
    dateOfBirth: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setForm(f => ({ ...f, referralCode: ref }))
      setRefLocked(true)
    }
  }, [searchParams])

  const update = (field: keyof FormData, value: string | boolean) => {
    if (field === 'country') {
      const country = value as string
      setCities(LATAM_DATA[country] || [])
      setForm(f => ({ ...f, country, city: '' }))
    } else {
      setForm(f => ({ ...f, [field]: value }))
    }
    setError('')
  }

  const validate = (): boolean => {
    if (!form.referralCode) { setError('El código de referido es obligatorio'); return false }
    if (!form.username || !form.fullName || !form.country || !form.city || !form.identityDocument || !form.dateOfBirth) {
      setError('Completa todos los campos'); return false
    }
    const dob = new Date(form.dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const m = today.getMonth() - dob.getMonth()
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
    if (age < 18) { setError('Debes ser mayor de 18 años'); return false }
    if (!form.email || !form.password || !form.confirmPassword) {
      setError('Completa todos los campos'); return false
    }
    if (form.password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres'); return false }
    if (!/(?=.*[A-Z])(?=.*[0-9])/.test(form.password)) {
      setError('La contraseña debe contener una mayúscula y un número'); return false
    }
    if (form.password !== form.confirmPassword) { setError('Las contraseñas no coinciden'); return false }
    if (!form.acceptTerms) { setError('Debes aceptar los términos y condiciones'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error)
        return
      }

      setSuccess({
        fullName: form.fullName,
        username: form.username,
        password: form.password,
        referralCode: data.user.referralCode,
      })
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const selectClass = `input-field appearance-none cursor-pointer bg-dark-900/50 border-dark-700 focus:border-neon-blue/50 focus:bg-dark-900/80 transition-all duration-300`
  const inputClass = `input-field bg-dark-900/50 border-dark-700 focus:border-neon-blue/50 focus:bg-dark-900/80 transition-all duration-300`

  // Welcome Screen
  if (success) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-neon-green/10 rounded-full blur-[120px]" />
        <div className="w-full max-w-md relative z-10 animate-slide-up">
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green/60 to-neon-blue/60 flex items-center justify-center shadow-lg shadow-neon-green/30">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <div className="glass-panel p-8 text-center border-neon-green/30">
            <p className="text-xs text-neon-green uppercase tracking-widest font-bold mb-2">Registro Exitoso</p>
            <h1 className="text-2xl font-bold text-white mb-1">Bienvenido,</h1>
            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-green to-neon-blue mb-6">{success.fullName}</p>

            <p className="text-dark-300 text-sm mb-6">
              Tu cuenta ha sido creada. Guarda tus credenciales de acceso:
            </p>

            <div className="space-y-3 mb-6 text-left">
              <div className="bg-dark-900/60 border border-white/5 rounded-xl px-4 py-3">
                <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Usuario</p>
                <p className="text-white font-semibold text-lg">{success.username}</p>
              </div>
              <div className="bg-dark-900/60 border border-white/5 rounded-xl px-4 py-3">
                <p className="text-[10px] text-dark-400 uppercase tracking-wider mb-1">Contraseña</p>
                <p className="text-white font-semibold text-lg tracking-widest">{success.password}</p>
              </div>
              <div className="bg-neon-blue/5 border border-neon-blue/20 rounded-xl px-4 py-3">
                <p className="text-[10px] text-neon-blue uppercase tracking-wider mb-1 font-bold">Tu Código de Referido</p>
                <p className="text-white font-bold text-xl tracking-widest">{success.referralCode}</p>
              </div>
            </div>

            <p className="text-dark-400 text-xs mb-6">
              Recibirás un correo de bienvenida con tu información.
            </p>

            <button
              onClick={() => { router.refresh(); router.push('/dashboard') }}
              className="btn-primary w-full flex items-center justify-center gap-2 group"
            >
              Ir a mi Panel
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-blue/10 rounded-full blur-[100px]" />

      <div className="w-full max-w-lg relative z-10 animate-fade-in text-white/90">
        <Link href="/" className="flex flex-col items-center justify-center gap-4 mb-10 group">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 object-contain group-hover:scale-105 transition-transform" />
          <span className="text-2xl font-bold">
            <span className="text-white">JD</span>
            <span className="text-neon-blue ml-1">INTERNACIONAL</span>
          </span>
        </Link>

        <div className="glass-panel p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Crear Cuenta</h2>
          <p className="text-dark-300 text-sm mb-6 text-center">Completa todos los campos para registrarte</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-6 text-red-400 text-sm flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Referido */}
            <div className="pb-4 border-b border-white/5">
              <p className="text-xs text-neon-blue uppercase tracking-wider font-bold mb-4">Información de Referido</p>
              <div className="mb-4">
                <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">
                  Código de Referido
                  {refLocked && (
                    <span className="ml-2 text-xs text-neon-green font-normal">Verificado</span>
                  )}
                </label>
                <div className="relative group/input">
                  <input
                    type="text"
                    className={`${inputClass} uppercase tracking-widest ${refLocked ? 'opacity-70 cursor-not-allowed border-neon-green/30 bg-neon-green/5' : ''}`}
                    placeholder="Ej: ADMIN001"
                    value={form.referralCode}
                    onChange={e => !refLocked && update('referralCode', e.target.value.toUpperCase())}
                    readOnly={refLocked}
                  />
                  {refLocked && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-4 h-4 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Personal */}
            <div className="pb-4 border-b border-white/5">
              <p className="text-xs text-neon-blue uppercase tracking-wider font-bold mb-4">Información Personal</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Usuario</label>
                  <input type="text" className={inputClass} placeholder="nombre_usuario" value={form.username} onChange={e => update('username', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Nombre Completo</label>
                  <input type="text" className={inputClass} placeholder="Juan Pérez" value={form.fullName} onChange={e => update('fullName', e.target.value)} />
                </div>

                {/* País */}
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">País</label>
                  <div className="relative group/input">
                    <select
                      className={selectClass}
                      value={form.country}
                      onChange={e => update('country', e.target.value)}
                      style={{ color: form.country ? '#fff' : '#6b7280' }}
                    >
                      <option value="" disabled className="bg-dark-900 text-dark-400">Selecciona tu país</option>
                      {COUNTRIES.map(c => (
                        <option key={c} value={c} className="bg-dark-900 text-white">{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none group-hover/input:text-neon-blue transition-colors" />
                  </div>
                </div>

                {/* Ciudad */}
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Ciudad</label>
                  <div className="relative group/input">
                    {form.country ? (
                      <>
                        <select
                          className={selectClass}
                          value={form.city}
                          onChange={e => update('city', e.target.value)}
                          style={{ color: form.city ? '#fff' : '#6b7280' }}
                        >
                          <option value="" disabled className="bg-dark-900 text-dark-400">Selecciona tu ciudad</option>
                          {cities.map(c => (
                            <option key={c} value={c} className="bg-dark-900 text-white">{c}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500 pointer-events-none group-hover/input:text-neon-blue transition-colors" />
                      </>
                    ) : (
                      <div className="input-field text-dark-400 cursor-not-allowed opacity-50 bg-dark-900/30">
                        Primero selecciona un país
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">C.I. (Documento de Identidad)</label>
                  <input type="text" className={inputClass} placeholder="12345678" value={form.identityDocument} onChange={e => update('identityDocument', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    className={inputClass}
                    value={form.dateOfBirth}
                    onChange={e => update('dateOfBirth', e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>

            {/* Cuenta */}
            <div>
              <p className="text-xs text-neon-blue uppercase tracking-wider font-bold mb-4">Información de Cuenta</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Correo Electrónico</label>
                  <input type="email" className={inputClass} placeholder="tu@correo.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className={`${inputClass} pr-12`}
                      placeholder="Min. 8 caracteres, 1 mayuscula, 1 numero"
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="mt-2 flex gap-4">
                      <span className={`text-[10px] sm:text-xs font-medium ${form.password.length >= 8 ? 'text-neon-green' : 'text-dark-500'}`}>8+ chars</span>
                      <span className={`text-[10px] sm:text-xs font-medium ${/[A-Z]/.test(form.password) ? 'text-neon-green' : 'text-dark-500'}`}>Mayúscula</span>
                      <span className={`text-[10px] sm:text-xs font-medium ${/[0-9]/.test(form.password) ? 'text-neon-green' : 'text-dark-500'}`}>Número</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-dark-300 mb-2 uppercase tracking-wide">Confirmar Contraseña</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={`${inputClass} pr-12`}
                      placeholder="Repite tu contraseña"
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={form.acceptTerms}
                    onChange={e => update('acceptTerms', e.target.checked)}
                    className="mt-1 w-4 h-4 accent-neon-blue rounded border-dark-600 bg-dark-800"
                  />
                  <span className="text-xs text-dark-300 group-hover:text-dark-200 transition-colors">
                    Acepto los <span className="text-neon-blue hover:underline">Términos y Condiciones</span> y la <span className="text-neon-blue hover:underline">Política de Privacidad</span>
                  </span>
                </label>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 mt-8 py-3.5 shadow-neon-blue/20">
              {loading ? (
                <div className="w-5 h-5 border-2 border-neon-blue/30 border-t-neon-blue rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Registrarse
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-dark-400 text-sm mt-8">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-neon-purple hover:text-neon-pink transition-colors font-bold tracking-wide">
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
