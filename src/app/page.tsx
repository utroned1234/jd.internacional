'use client'

import Link from 'next/link'
import { Network, TrendingUp, Zap, Radio, Users, Globe, DollarSign } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden font-sans text-white bg-transparent">
      {/* Background dynamics - Liquid Energy clouds */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,rgba(58,99,204,0.1)_0%,transparent_70%)] animate-pulse-slow" />
        <div className="absolute top-1/4 right-[-10%] w-[800px] h-[800px] bg-[#DA6CE9]/15 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute bottom-1/4 left-[-10%] w-[900px] h-[900px] bg-[#60C6E5]/10 rounded-full blur-[150px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation Bar */}
        <header className="flex items-center justify-between px-6 py-5 md:px-12 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#60C6E5] to-[#DA6CE9] p-[1px] shadow-[0_0_20px_rgba(96,198,229,0.3)]">
              <div className="w-full h-full rounded-2xl bg-[#0F0A2E] flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="JD Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              </div>
            </div>
            <span className="text-xl md:text-3xl font-black tracking-tighter uppercase">
              JD <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60C6E5] to-[#7F56EF]">INTERNACIONAL</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-10">
            <Link href="/login" className="text-sm font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Entrar</Link>
            <Link href="/register" className="btn-liquid transform scale-90">Comenzar Ahora</Link>
          </div>

          {/* Mobile nav */}
          <div className="flex lg:hidden items-center gap-3">
            <Link href="/login" className="text-xs font-black uppercase tracking-[0.15em] text-white/60 hover:text-white transition-colors px-3 py-2">
              Entrar
            </Link>
            <Link
              href="/register"
              className="text-xs font-black uppercase tracking-[0.15em] text-white bg-gradient-to-r from-[#3A63CC] via-[#7F56EF] to-[#DA6CE9] px-4 py-2 rounded-2xl border-t border-white/30 hover:scale-105 transition-transform active:scale-95"
            >
              Unirse
            </Link>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 max-w-7xl mx-auto px-6 pt-20 sm:pt-32 pb-24 sm:pb-40 text-center flex flex-col items-center">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/20 backdrop-blur-3xl mb-10 md:mb-12 shadow-2xl">
            <span className="w-2.5 h-2.5 rounded-full bg-[#60C6E5] shadow-[0_0_15px_#60C6E5] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#9EE7EC]">Ecosistema Líquido v4.0</span>
          </div>

          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black mb-8 md:mb-10 tracking-tighter leading-[0.9] uppercase">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-[#F3F4F9] to-white/20">EL FUTURO</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60C6E5] via-[#7F56EF] to-[#DA6CE9]">SIN LÍMITES</span>
          </h1>

          <p className="max-w-2xl md:max-w-3xl text-lg sm:text-xl md:text-2xl text-white/50 font-semibold leading-relaxed mb-12 md:mb-16 px-2 md:px-6">
            Lidera la nueva era del <span className="text-white">Network Marketing</span> con inteligencia artificial, transacciones líquidas y diseño de última generación.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 mb-16 sm:mb-24 w-full max-w-sm sm:max-w-none sm:w-auto">
            <Link href="/register" className="btn-liquid text-center">
              Únete a la Red
            </Link>
            <Link href="/login" className="btn-outline-water text-center">
              Oficina Virtual
            </Link>
          </div>

          {/* Stats / Social Proof */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-20 sm:mb-32 w-full">
            {[
              { icon: Users, value: '1,200+', label: 'Miembros Activos', accent: '#60C6E5' },
              { icon: Globe, value: '18', label: 'Países', accent: '#7F56EF' },
              { icon: DollarSign, value: '$2.4M', label: 'Distribuido', accent: '#DA6CE9' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
                <stat.icon className="w-4 h-4 shrink-0" style={{ color: stat.accent }} />
                <span className="text-base font-black text-white">{stat.value}</span>
                <span className="text-xs font-bold uppercase tracking-[0.15em] text-white/40">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Liquid Glass Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 w-full text-left">
            {[
              { title: 'IA Fluida', desc: 'Sistemas inteligentes que optimizan cada rama de tu árbol binario automáticamente.', icon: Zap, accent: '#60C6E5' },
              { title: 'Red Global', desc: 'Expande tu negocio a través de continentes con latencia cero y soporte total.', icon: Network, accent: '#7F56EF' },
              { title: 'Capital Real', desc: 'Gestiona tus fondos con transparencia cristalina y retiros instantáneos.', icon: TrendingUp, accent: '#DA6CE9' },
            ].map((feature, i) => (
              <div key={i} className="water-glass-glow p-8 md:p-12 group border-white/5">
                <div className="relative mb-8 md:mb-10">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] bg-gradient-to-br from-white/20 to-transparent p-[1px] group-hover:scale-110 transition-transform duration-700">
                    <div className="w-full h-full rounded-[1.5rem] bg-[#0F0A2E]/80 backdrop-blur-2xl flex items-center justify-center">
                      <feature.icon className="w-8 h-8 md:w-10 md:h-10" style={{ color: feature.accent }} />
                    </div>
                  </div>
                  <div className="absolute inset-0 blur-3xl opacity-20 group-hover:opacity-50 transition-all duration-700" style={{ backgroundColor: feature.accent }} />
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase mb-4 md:mb-6 tracking-tighter text-white">{feature.title}</h3>
                <p className="text-white/40 text-base md:text-lg leading-snug font-bold">{feature.desc}</p>
              </div>
            ))}
          </div>
        </main>

        {/* Footer */}
        <footer className="px-6 py-12 md:py-16 border-t border-white/10 backdrop-blur-3xl bg-black/20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
            <div className="flex items-center gap-4 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 shadow-inner">
              <Radio className="w-5 h-5 text-[#60C6E5] animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">Servidores JD: Online & Fluidos</span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">JD INTERNACIONAL © 2026. BORN FOR SUCCESS.</span>
            <div className="flex gap-10 text-[10px] font-black uppercase tracking-[0.3em]">
              <Link href="/terms" className="text-white/40 hover:text-[#60C6E5] transition-colors">Términos</Link>
              <Link href="/privacy" className="text-white/40 hover:text-[#DA6CE9] transition-colors">Privacidad</Link>
            </div>
          </div>
        </footer>
      </div>

      {/* Decorative Energy Grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(158, 231, 236, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(110, 81, 222, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
