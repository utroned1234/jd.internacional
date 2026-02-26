'use client'

import { useState, useEffect } from 'react'
import { Wallet, Users, Network, ArrowUpRight } from 'lucide-react'

interface Commission {
  id: string
  type: 'BINARY_BONUS' | 'DIRECT_BONUS'
  amount: number
  description: string | null
  createdAt: string
}

interface Summary {
  total: number
  byType: { type: string; total: number; count: number }[]
}

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary>({ total: 0, byType: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/commissions')
      .then(r => r.json())
      .then(d => {
        setCommissions(d.commissions || [])
        setSummary(d.summary || { total: 0, byType: [] })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(0,255,136,0.2)', borderTopColor: '#00FF88' }} />
      </div>
    )
  }

  const binaryTotal = summary.byType.find(t => t.type === 'BINARY_BONUS')?.total || 0
  const directTotal = summary.byType.find(t => t.type === 'DIRECT_BONUS')?.total || 0

  return (
    <div className="px-4 sm:px-6 pt-6 max-w-6xl mx-auto pb-20 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.2)' }}>
          <Wallet className="w-5 h-5" style={{ color: '#00FF88' }} />
        </div>
        <div>
          <h1 className="text-xl font-medium text-white uppercase tracking-widest">Wallet</h1>
          <p className="text-xs font-light tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Resumen detallado de tus ganancias</p>
        </div>
      </div>

      {/* Línea decorativa */}
      <div className="h-px w-full" style={{ background: 'linear-gradient(90deg, rgba(0,255,136,0.3), rgba(0,245,255,0.2), transparent)' }} />

      {/* Cards resumen */}
      <div className="grid md:grid-cols-3 gap-4">

        {/* Total */}
        <div className="relative rounded-2xl p-6 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,255,136,0.08), rgba(0,194,255,0.04))',
            border: '1px solid rgba(0,255,136,0.2)',
            boxShadow: '0 0 30px rgba(0,255,136,0.06)'
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #00FF8870, transparent)' }} />
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full blur-2xl opacity-20"
            style={{ background: '#00FF88' }} />
          <p className="text-[9px] font-black uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Total Acumulado</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-black tracking-tighter" style={{ color: '#00FF88' }}>${summary.total.toFixed(2)}</span>
            <span className="text-xs font-black flex items-center" style={{ color: '#00FF88' }}>
              <ArrowUpRight className="w-3 h-3" />100%
            </span>
          </div>
          <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full w-full rounded-full" style={{ background: 'linear-gradient(90deg, #00FF88, #00C2FF)' }} />
          </div>
        </div>

        {/* Bono Binario */}
        <div className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(0,245,255,0.07), rgba(0,102,255,0.04))',
            border: '1px solid rgba(0,245,255,0.15)',
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #00F5FF50, transparent)' }} />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.2)' }}>
              <Network className="w-4 h-4" style={{ color: '#00F5FF' }} />
            </div>
            <span className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>Bono Binario</span>
          </div>
          <p className="text-2xl font-black tracking-tighter" style={{ color: '#00F5FF' }}>${binaryTotal.toFixed(2)}</p>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Ingresos por red</p>
        </div>

        {/* Bono Directo */}
        <div className="relative rounded-2xl p-6 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: 'linear-gradient(135deg, rgba(155,0,255,0.07), rgba(255,45,247,0.04))',
            border: '1px solid rgba(155,0,255,0.2)',
          }}>
          <div className="absolute top-0 left-0 right-0 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #9B00FF50, transparent)' }} />
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(155,0,255,0.1)', border: '1px solid rgba(155,0,255,0.2)' }}>
              <Users className="w-4 h-4" style={{ color: '#9B00FF' }} />
            </div>
            <span className="text-xs font-light" style={{ color: 'rgba(255,255,255,0.5)' }}>Bono Directo</span>
          </div>
          <p className="text-2xl font-black tracking-tighter" style={{ color: '#9B00FF' }}>${directTotal.toFixed(2)}</p>
          <p className="text-[9px] font-black uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Ingresos por referidos</p>
        </div>
      </div>

      {/* Historial */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00FF8840, #00F5FF30, transparent)' }} />

        <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Historial de Transacciones
          </h3>
          <button className="text-[10px] font-black uppercase tracking-widest transition-colors"
            style={{ color: 'rgba(0,245,255,0.6)' }}>
            Ver todo
          </button>
        </div>

        {commissions.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <Wallet className="w-7 h-7" style={{ color: 'rgba(255,255,255,0.15)' }} />
            </div>
            <p className="text-sm font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Aún no tienes comisiones registradas.
            </p>
          </div>
        ) : (
          <div>
            {commissions.map((c) => {
              const isBinary = c.type === 'BINARY_BONUS'
              const color = isBinary ? '#00F5FF' : '#9B00FF'
              return (
                <div key={c.id} className="p-4 flex items-center justify-between transition-colors group"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                      {isBinary
                        ? <Network className="w-4 h-4" style={{ color }} />
                        : <Users className="w-4 h-4" style={{ color }} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {isBinary ? 'Bono Binario' : 'Bono Directo'}
                      </p>
                      <p className="text-[10px] font-light" style={{ color: 'rgba(255,255,255,0.25)' }}>
                        {c.description || new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-black font-mono" style={{ color: '#00FF88' }}>
                    +${c.amount.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
