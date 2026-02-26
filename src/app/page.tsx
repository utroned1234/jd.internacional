'use client'

import Link from 'next/link'
import { Bot, TrendingUp, Megaphone, Store, Layers, ShieldCheck, Zap, Crown } from 'lucide-react'

const FEATURES = [
  {
    icon: Bot,
    title: 'Bots de WhatsApp con IA',
    desc: 'Automatiza tus ventas 24/7 con bots inteligentes que atienden a tus clientes, muestran productos y cierran ventas mientras duermes.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/8',
    border: 'border-cyan-500/15',
    glow: 'from-cyan-500/20',
  },
  {
    icon: Megaphone,
    title: 'Publicidad Digital con IA',
    desc: 'Crea y lanza campañas en Meta, Google y TikTok Ads en minutos usando inteligencia artificial para maximizar resultados.',
    color: 'text-pink-400',
    bg: 'bg-pink-500/8',
    border: 'border-pink-500/15',
    glow: 'from-pink-500/20',
  },
  {
    icon: Store,
    title: 'Tienda Virtual Propia',
    desc: 'Tu propia tienda online para vender productos con pasarela de pago integrada. Lista en minutos, sin conocimientos técnicos.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/8',
    border: 'border-yellow-500/15',
    glow: 'from-yellow-500/20',
  },
  {
    icon: Layers,
    title: 'Landing Pages con IA',
    desc: 'Genera páginas de ventas profesionales con inteligencia artificial. Capta leads y convierte visitas en clientes automáticamente.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/8',
    border: 'border-emerald-500/15',
    glow: 'from-emerald-500/20',
  },
  {
    icon: TrendingUp,
    title: 'Panel de Comisiones',
    desc: 'Visualiza tus ganancias en tiempo real, solicita retiros y gestiona tu billetera digital desde un solo lugar.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/15',
    glow: 'from-blue-500/20',
  },
]

const PLANS = [
  {
    name: 'Pack Básico',
    icon: Zap,
    color: 'text-cyan-400',
    border: 'border-cyan-500/20',
    bg: 'bg-cyan-500/5',
    features: ['1 Bot de WhatsApp', 'Catálogo 2 productos', '1 Tienda virtual', 'Capacitaciones Zoom'],
  },
  {
    name: 'Pack Pro',
    icon: TrendingUp,
    color: 'text-purple-400',
    border: 'border-purple-500/30',
    bg: 'bg-purple-500/8',
    popular: true,
    features: ['2 Bots personalizados', 'Catálogo 20 productos', 'Publicidad Meta / TikTok / Google', 'Landing Pages con IA'],
  },
  {
    name: 'Pack Elite',
    icon: Crown,
    color: 'text-yellow-400',
    border: 'border-yellow-500/20',
    bg: 'bg-yellow-500/5',
    features: ['Bots ilimitados', 'Productos ilimitados', 'Todo el Pack Pro incluido', 'Manager dedicado 1:1'],
  },
]

const HOW_IT_WORKS = [
  { step: '01', title: 'Regístrate gratis', desc: 'Crea tu cuenta con el código de un miembro activo. El proceso toma menos de 2 minutos.' },
  { step: '02', title: 'Elige tu pack', desc: 'Selecciona el plan que mejor se adapte a tu negocio. Desde el pack básico hasta el elite.' },
  { step: '03', title: 'Activa y escala', desc: 'Configura tus herramientas, invita a tu red y empieza a generar comisiones desde el primer día.' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-x-hidden text-white">

      {/* Grid sutil */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      {/* Orbes de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full bg-purple-700/12 blur-[140px]" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-[130px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[130px]" />
      </div>

      {/* ── HERO ── */}
      <section className="relative px-5 text-center pt-16 pb-14">
        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/[0.04] border border-white/[0.07] mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-white/35">Plataforma activa · LATAM 2026</span>
          </div>

          {/* Logo */}
          <div className="relative mb-8">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-purple-600/15 to-pink-500/10 blur-3xl scale-125" />
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl border border-white/10 overflow-hidden bg-black/50 backdrop-blur-xl shadow-2xl shadow-black/60">
              <img src="/logo.png" alt="JD Internacional" className="w-full h-full object-contain p-4" />
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-4">
            <span className="text-white/90">El ecosistema digital</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">
              para crecer sin límites
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-white/38 leading-relaxed max-w-md mx-auto mb-8">
            Bots de WhatsApp con IA, publicidad digital, tiendas virtuales, landing pages y un sistema de referidos que trabaja para ti las 24 horas.
          </p>

          {/* CTAs — siempre en fila, compactos */}
          <div className="flex flex-row gap-2.5 items-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-black uppercase tracking-wider text-white border border-white/10 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/30"
            >
              Crear cuenta
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-white/[0.05] border border-white/10 text-xs font-black uppercase tracking-wider text-white/60 hover:bg-white/[0.09] hover:text-white transition-all"
            >
              Ingresar
            </Link>
          </div>

          <p className="text-[9px] text-white/18 mt-4 tracking-wide">Sin tarjeta de crédito · Registro en 2 minutos</p>

        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
      </section>

      {/* ── FEATURES ── */}
      <section className="relative py-14 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-purple-400 mb-2">Todo en un solo lugar</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Herramientas que potencian tu negocio
            </h2>
            <p className="text-xs text-white/28 mt-2 max-w-sm mx-auto leading-relaxed">
              Cada herramienta diseñada para vender más, automatizar y escalar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`group relative rounded-xl border ${f.border} ${f.bg} p-5 overflow-hidden transition-all duration-300 hover:border-opacity-40`}
              >
                <div className={`absolute top-0 left-0 right-0 h-px bg-gradient-to-r ${f.glow} to-transparent opacity-50`} />
                <div className={`w-8 h-8 rounded-lg ${f.bg} border ${f.border} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}>
                  <f.icon size={14} className={f.color} />
                </div>
                <h3 className={`text-[11px] font-black mb-1.5 ${f.color} uppercase tracking-wide`}>{f.title}</h3>
                <p className="text-[11px] text-white/32 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative py-14 px-5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-cyan-400 mb-2">Sencillo y rápido</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">¿Cómo funciona?</h2>
          </div>
          <div className="space-y-2.5">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={i} className="group flex gap-4 items-start bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 hover:bg-white/[0.03] transition-colors duration-300">
                <span className="text-3xl font-black text-white/[0.06] shrink-0 leading-none mt-0.5">{h.step}</span>
                <div>
                  <h3 className="text-xs font-black text-white mb-1">{h.title}</h3>
                  <p className="text-[11px] text-white/32 leading-relaxed">{h.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANS ── */}
      <section className="relative py-14 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[9px] font-black uppercase tracking-widest text-yellow-400 mb-2">Elige tu nivel</p>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">Packs disponibles</h2>
            <p className="text-xs text-white/28 mt-2">Empieza donde quieras y escala cuando estés listo.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLANS.map((p, i) => (
              <div key={i} className={`relative rounded-xl border ${p.border} ${p.bg} p-4`}>
                {p.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md bg-gradient-to-r from-purple-600 to-purple-500 text-[9px] font-black uppercase tracking-wider text-white">
                    Más popular
                  </div>
                )}
                <div className={`flex items-center gap-2 mb-3 ${p.popular ? 'mt-2' : ''}`}>
                  <p.icon size={13} className={p.color} />
                  <span className={`text-[11px] font-black ${p.color}`}>{p.name}</span>
                </div>
                <ul className="space-y-1.5">
                  {p.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2">
                      <ShieldCheck size={10} className={`${p.color} shrink-0 mt-0.5`} />
                      <span className="text-[10px] text-white/38 leading-relaxed">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-black uppercase tracking-wider text-white border border-white/10 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/30"
            >
              Ver precios y unirme
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative py-14 px-5">
        <div className="max-w-md mx-auto">
          <div className="relative rounded-2xl border border-white/[0.07] bg-white/[0.02] p-10 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/8 via-transparent to-cyan-500/8 pointer-events-none" />
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/25 to-transparent" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-white/10 mx-auto mb-5 shadow-xl shadow-black/40">
                <img src="/logo.png" alt="JD Internacional" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight mb-2">
                Empieza hoy mismo
              </h2>
              <p className="text-xs text-white/32 mb-6 leading-relaxed max-w-xs mx-auto">
                Únete a emprendedores en toda Latinoamérica que ya están construyendo su negocio digital con JD Internacional.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-purple-600 text-xs font-black uppercase tracking-wider text-white border border-white/10 hover:from-cyan-400 hover:to-purple-500 transition-all shadow-lg shadow-purple-900/30"
              >
                Crear mi cuenta gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] mt-2">
        <div className="max-w-5xl mx-auto px-5 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="w-7 h-7 rounded-lg overflow-hidden border border-white/10">
              <img src="/logo.png" alt="JD Internacional" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-[9px] font-bold uppercase tracking-widest">
              <Link href="/login" className="text-white/22 hover:text-white transition-colors">Iniciar sesión</Link>
              <Link href="/register" className="text-white/22 hover:text-white transition-colors">Registro</Link>
              <Link href="/privacy" className="text-white/22 hover:text-cyan-400 transition-colors">Privacidad</Link>
              <Link href="/terms" className="text-white/22 hover:text-purple-400 transition-colors">Términos</Link>
            </div>
            <span className="text-[9px] text-white/14 font-bold uppercase tracking-widest">
              © 2026 JD Internacional
            </span>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.03]">
            <p className="text-[9px] text-white/14 leading-relaxed text-center max-w-3xl mx-auto">
              <strong className="text-white/18">Política de Privacidad:</strong> JD Internacional recopila datos personales únicamente para la prestación de sus servicios. Tu información no es vendida ni compartida con terceros sin tu consentimiento explícito. Los datos son almacenados de forma segura con cifrado de extremo a extremo. Tienes derecho a solicitar la eliminación de tu cuenta y datos en cualquier momento contactando a soporte. Al registrarte, aceptas nuestros{' '}
              <Link href="/terms" className="text-white/25 hover:text-white underline">Términos de Uso</Link> y{' '}
              <Link href="/privacy" className="text-white/25 hover:text-white underline">Política de Privacidad</Link> completa.
            </p>
          </div>
        </div>
      </footer>

    </div>
  )
}
