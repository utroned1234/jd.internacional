'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Network, Wallet, Briefcase, GraduationCap, ShoppingCart } from 'lucide-react'

const navItems = [
  { href: '/dashboard',             icon: Home,          label: 'Inicio' },
  { href: '/dashboard/network',     icon: Network,       label: 'Red' },
  { href: '/dashboard/services',    icon: Briefcase,     label: 'Servicios' },
  { href: '/dashboard/courses',     icon: GraduationCap, label: 'Cursos' },
  { href: '/dashboard/store',       icon: ShoppingCart,  label: 'Tienda' },
  { href: '/dashboard/wallet',      icon: Wallet,        label: 'Wallet' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── SIDEBAR DESKTOP ── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-60 flex-col z-50"
        style={{
          background: 'linear-gradient(180deg, rgba(3,1,14,0.95) 0%, rgba(8,2,28,0.98) 100%)',
          borderRight: '1px solid rgba(0,245,255,0.08)',
          backdropFilter: 'blur(40px)',
          boxShadow: '4px 0 40px rgba(0,0,0,0.5), inset -1px 0 0 rgba(0,245,255,0.05)'
        }}>

        {/* Línea neon lateral decorativa */}
        <div className="absolute top-20 bottom-20 right-0 w-px"
          style={{ background: 'linear-gradient(180deg, transparent, #00F5FF40, #FF2DF720, transparent)' }} />

        {/* Logo */}
        <div className="px-6 py-8" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <Link href="/dashboard" className="flex flex-col items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ background: 'radial-gradient(circle, #00F5FF, transparent)' }} />
              <img src="/logo.png" alt="Logo" className="relative w-16 h-16 object-contain group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="text-center">
              <span className="text-sm font-black tracking-[0.2em] uppercase">
                <span className="text-white">JD </span>
                <span style={{ color: '#00F5FF' }}>INTERNACIONAL</span>
              </span>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden"
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(123,0,255,0.06))',
                  border: '1px solid rgba(0,245,255,0.2)',
                  boxShadow: '0 0 20px rgba(0,245,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
                } : {
                  border: '1px solid transparent',
                }}>

                {/* Barra izquierda activa */}
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full"
                    style={{ background: 'linear-gradient(180deg, #00F5FF, #FF2DF7)' }} />
                )}

                {/* Hover bg */}
                {!isActive && (
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(255,255,255,0.03)' }} />
                )}

                <item.icon className="w-4 h-4 shrink-0 relative z-10 transition-all duration-300"
                  style={{ color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.3)' }} />

                <span className="text-sm font-medium relative z-10 transition-colors duration-300"
                  style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.35)' }}>
                  {item.label}
                </span>

                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full relative z-10"
                    style={{ background: '#00F5FF', boxShadow: '0 0 8px #00F5FF' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="rounded-xl p-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(123,0,255,0.04))',
              border: '1px solid rgba(0,245,255,0.12)'
            }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #00F5FF50, transparent)' }} />
            <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Plan Actual</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Premium</span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,255,136,0.15)', color: '#00FF88', border: '1px solid rgba(0,255,136,0.3)' }}>
                Activo
              </span>
            </div>
            <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <div className="h-full w-3/4 rounded-full"
                style={{ background: 'linear-gradient(90deg, #00F5FF, #FF2DF7)' }} />
            </div>
          </div>
          <p className="text-[9px] text-center mt-3" style={{ color: 'rgba(255,255,255,0.12)' }}>JD INTERNACIONAL © 2026</p>
        </div>
      </aside>

      {/* ── BARRA MÓVIL ── */}
      <div className="flex lg:hidden fixed bottom-0 left-0 right-0 z-50 justify-center px-3"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)' }}>
        <nav className="w-full max-w-md px-1 py-1.5 rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(3,1,14,0.92), rgba(8,2,28,0.96))',
            border: '1px solid rgba(0,245,255,0.12)',
            backdropFilter: 'blur(40px)',
            boxShadow: '0 -4px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(0,245,255,0.08)'
          }}>
          {/* Línea neon superior */}
          <div className="absolute top-0 left-8 right-8 h-px rounded-full"
            style={{ background: 'linear-gradient(90deg, transparent, #00F5FF60, #FF2DF740, transparent)' }} />

          <div className="flex items-center justify-between relative">
            {navItems.map(item => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}
                  className="flex flex-col items-center flex-1 py-1 transition-all duration-300">
                  <div className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl w-full transition-all duration-300"
                    style={isActive ? {
                      background: 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(123,0,255,0.08))',
                      boxShadow: '0 0 15px rgba(0,245,255,0.12)'
                    } : {}}>
                    <item.icon className="w-4 h-4 transition-all duration-300"
                      style={isActive
                        ? { color: '#00F5FF', filter: 'drop-shadow(0 0 6px #00F5FF)' }
                        : { color: 'rgba(255,255,255,0.25)' }} />
                    <span className="text-[9px] font-bold tracking-wide transition-colors duration-300"
                      style={{ color: isActive ? '#00F5FF' : 'rgba(255,255,255,0.2)' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}
