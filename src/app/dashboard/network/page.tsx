'use client'

import { useState, useEffect } from 'react'
import { Users, Copy, Check, TrendingUp, Network, DollarSign, ChevronDown, ChevronUp, Loader2, Gift } from 'lucide-react'

const LEVEL_COLORS = [
  { border: 'border-cyan-500/30', bg: 'bg-cyan-500/8', text: 'text-cyan-400', dot: 'bg-cyan-400', badge: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25' },
  { border: 'border-purple-500/30', bg: 'bg-purple-500/8', text: 'text-purple-400', dot: 'bg-purple-400', badge: 'bg-purple-500/15 text-purple-400 border-purple-500/25' },
  { border: 'border-blue-500/30', bg: 'bg-blue-500/8', text: 'text-blue-400', dot: 'bg-blue-400', badge: 'bg-blue-500/15 text-blue-400 border-blue-500/25' },
  { border: 'border-orange-500/30', bg: 'bg-orange-500/8', text: 'text-orange-400', dot: 'bg-orange-400', badge: 'bg-orange-500/15 text-orange-400 border-orange-500/25' },
  { border: 'border-pink-500/30', bg: 'bg-pink-500/8', text: 'text-pink-400', dot: 'bg-pink-400', badge: 'bg-pink-500/15 text-pink-400 border-pink-500/25' },
]

interface LevelData {
  level: number
  count: number
  active: number
  members: { username: string; fullName: string; isActive: boolean }[]
}

interface BonusEntry {
  id: string
  amount: number
  description: string | null
  createdAt: string
}

interface NetworkData {
  referralCode: string
  levels: LevelData[]
  recentBonuses: BonusEntry[]
  stats: {
    directReferrals: number
    totalNetwork: number
    totalActive: number
    totalLevels: number
    totalCommissions: number
  }
}

export default function NetworkPage() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState<number[]>([1])

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  useEffect(() => {
    fetch('/api/network')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function copyLink() {
    if (!data) return
    navigator.clipboard.writeText(`${baseUrl}/register?ref=${data.referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function toggleLevel(level: number) {
    setExpanded(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-white/30 text-sm">Error al cargar la red</p>
      </div>
    )
  }

  const { stats, levels, referralCode, recentBonuses } = data

  return (
    <div className="px-4 md:px-6 pt-6 max-w-4xl mx-auto pb-24 text-white space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Network size={18} className="text-white/60" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Mi Red Uninivel</h1>
          <p className="text-[11px] text-white/30">Rastrea tu red de distribución nivel a nivel</p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Red total', value: stats.totalNetwork, icon: Users, color: 'text-cyan-400', bg: 'bg-cyan-500/8 border-cyan-500/20' },
          { label: 'Activos', value: stats.totalActive, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/8 border-green-500/20' },
          { label: 'Directos', value: stats.directReferrals, icon: Network, color: 'text-purple-400', bg: 'bg-purple-500/8 border-purple-500/20' },
          { label: 'Comisiones', value: `$${stats.totalCommissions.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-400', bg: 'bg-yellow-500/8 border-yellow-500/20' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className={`rounded-2xl border p-4 ${s.bg}`}>
              <Icon size={15} className={`${s.color} mb-2`} />
              <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          )
        })}
      </div>

      {/* Referral link */}
      <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">Tu link de referido</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 font-mono text-xs text-white/50 truncate">
            {baseUrl}/register?ref={referralCode}
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all active:scale-[0.97]"
          >
            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* Levels breakdown */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Detalle por nivel</p>

        {levels.length === 0 ? (
          <div className="text-center py-16 bg-white/[0.015] border border-dashed border-white/8 rounded-3xl">
            <Users size={28} className="text-white/20 mx-auto mb-3" />
            <p className="text-white/30 text-sm font-bold">Aún no tienes referidos</p>
            <p className="text-white/20 text-xs mt-1">Comparte tu link para empezar a construir tu red</p>
          </div>
        ) : (
          levels.map((level) => {
            const color = LEVEL_COLORS[(level.level - 1) % LEVEL_COLORS.length]
            const isExpanded = expanded.includes(level.level)

            return (
              <div key={level.level} className={`rounded-2xl border ${color.border} overflow-hidden`}>
                {/* Header row */}
                <button
                  onClick={() => toggleLevel(level.level)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-white/3 transition-all"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black border ${color.badge} shrink-0`}>
                    N{level.level}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold">
                      {level.level === 1 ? 'Referidos directos' : `Nivel ${level.level}`}
                    </p>
                    <p className="text-[10px] text-white/30">
                      {level.active} activos · {level.count - level.active} inactivos
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`text-xl font-black ${color.text}`}>{level.count}</span>
                    {isExpanded
                      ? <ChevronUp size={14} className="text-white/30" />
                      : <ChevronDown size={14} className="text-white/30" />
                    }
                  </div>
                </button>

                {/* Progress bar */}
                <div className="h-0.5 mx-4 mb-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${color.dot}`}
                    style={{ width: `${level.count > 0 ? (level.active / level.count) * 100 : 0}%` }}
                  />
                </div>

                {/* Members list */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {level.members.map((m, mi) => (
                        <div key={mi} className="flex items-center gap-2.5 py-1.5 px-3 bg-white/3 rounded-xl">
                          <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${m.isActive ? color.dot : 'bg-white/15'}`} />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{m.fullName}</p>
                            <p className="text-[10px] text-white/30 truncate">@{m.username}</p>
                          </div>
                          <span className={`ml-auto text-[9px] font-bold uppercase shrink-0 ${m.isActive ? color.text : 'text-white/20'}`}>
                            {m.isActive ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Bonos de patrocinio recibidos */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Bonos de patrocinio recibidos</p>

        {recentBonuses.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.015] border border-dashed border-white/8 rounded-3xl">
            <Gift size={24} className="text-white/20 mx-auto mb-2" />
            <p className="text-white/25 text-xs">Aún no tienes bonos registrados</p>
            <p className="text-white/15 text-[11px] mt-1">Cuando alguien de tu red active un plan recibirás el 20%</p>
          </div>
        ) : (
          <div className="bg-white/[0.025] border border-white/8 rounded-2xl divide-y divide-white/5 overflow-hidden">
            {recentBonuses.map((bonus) => (
              <div key={bonus.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0">
                  <Gift size={13} className="text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/70 truncate">{bonus.description ?? 'Bono de patrocinio'}</p>
                  <p className="text-[10px] text-white/25">
                    {new Date(bonus.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-black text-yellow-400 shrink-0">+${bonus.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
