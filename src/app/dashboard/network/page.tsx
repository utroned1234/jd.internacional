'use client'

import { useState, useEffect } from 'react'
import { Users, Copy, Check, TrendingUp, Network, DollarSign, ChevronDown, ChevronUp, Gift, Share2, UserCircle, Zap } from 'lucide-react'

// ── Colores por nivel ────────────────────────────────────────────────────────
const LEVEL_CFG = [
  { color: '#00F5FF', shadow: 'rgba(0,245,255,0.35)', label: 'Referidos directos',  ring: 'rgba(0,245,255,0.25)' },
  { color: '#FF2DF7', shadow: 'rgba(255,45,247,0.35)', label: 'Nivel 2',            ring: 'rgba(255,45,247,0.25)' },
  { color: '#9B00FF', shadow: 'rgba(155,0,255,0.35)',  label: 'Nivel 3',            ring: 'rgba(155,0,255,0.25)' },
  { color: '#FFB800', shadow: 'rgba(255,184,0,0.35)',  label: 'Nivel 4',            ring: 'rgba(255,184,0,0.25)' },
  { color: '#00FF88', shadow: 'rgba(0,255,136,0.35)',  label: 'Nivel 5',            ring: 'rgba(0,255,136,0.25)' },
]

function getLevel(n: number) { return LEVEL_CFG[(n - 1) % LEVEL_CFG.length] }

// ── Types ────────────────────────────────────────────────────────────────────
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

// ── Avatar node ──────────────────────────────────────────────────────────────
function AvatarNode({ name, active, color, size = 36 }: { name: string; active: boolean; color: string; size?: number }) {
  const initial = name.charAt(0).toUpperCase()
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-black text-white"
        style={{
          background: `${color}20`,
          border: `1.5px solid ${color}50`,
          fontSize: size > 32 ? 13 : 10,
          boxShadow: active ? `0 0 8px ${color}40` : 'none',
        }}
      >
        {initial}
      </div>
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
        style={{ width: size > 32 ? 9 : 7, height: size > 32 ? 9 : 7, background: active ? '#00FF88' : 'rgba(255,255,255,0.15)' }}
      />
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
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
    setTimeout(() => setCopied(false), 2500)
  }

  function toggleLevel(level: number) {
    setExpanded(prev => prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-2 rounded-full animate-spin"
          style={{ borderColor: 'rgba(0,245,255,0.2)', borderTopColor: '#00F5FF' }} />
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
  const activePct = stats.totalNetwork > 0 ? Math.round((stats.totalActive / stats.totalNetwork) * 100) : 0

  return (
    <div className="px-4 md:px-6 pt-6 max-w-4xl mx-auto pb-24 text-white space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
          <Network className="w-5 h-5" style={{ color: '#00F5FF' }} />
        </div>
        <div>
          <h1 className="text-xl font-medium text-white uppercase tracking-widest">Mi Red Uninivel</h1>
          <p className="text-xs font-light tracking-widest mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {stats.totalNetwork} miembros en {stats.totalLevels} niveles
          </p>
        </div>
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Red total',  val: stats.totalNetwork,                           from: '#00F5FF', to: '#0066FF',  icon: Users },
          { label: 'Activos',    val: stats.totalActive,                            from: '#00FF88', to: '#00C2FF',  icon: TrendingUp },
          { label: 'Directos',   val: stats.directReferrals,                        from: '#FF2DF7', to: '#9B00FF',  icon: Network },
          { label: 'Comisiones', val: `$${stats.totalCommissions.toFixed(2)}`,      from: '#FFB800', to: '#FF5C00',  icon: DollarSign },
        ].map((s, i) => (
          <div key={i}
            className="relative rounded-2xl p-4 overflow-hidden border"
            style={{ background: `linear-gradient(135deg, ${s.from}12, ${s.to}08)`, borderColor: `${s.from}25` }}>
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${s.from}80, transparent)` }} />
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.from }} />
            <p className="text-2xl font-black tracking-tighter" style={{ color: s.from }}>{s.val}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── REFERRAL BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden p-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(155,0,255,0.06))', border: '1px solid rgba(0,245,255,0.15)' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, transparent)' }} />
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="w-3.5 h-3.5" style={{ color: '#00F5FF' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00F5FF' }}>Tu link de referido</p>
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00F5FF' }}>
            {referralCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-xl px-3 py-2 font-mono text-xs truncate"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
            {baseUrl}/register?ref={referralCode}
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-[0.97]"
            style={{
              background: copied ? 'rgba(0,255,136,0.15)' : 'rgba(0,245,255,0.12)',
              border: `1px solid ${copied ? 'rgba(0,255,136,0.35)' : 'rgba(0,245,255,0.3)'}`,
              color: copied ? '#00FF88' : '#00F5FF',
            }}
          >
            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* ── ÁRBOL VISUAL ── */}
      {levels.length > 0 && (
        <div className="relative rounded-2xl overflow-hidden p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)' }} />
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-5 text-center">Estructura de tu red</p>

          {/* Nodo raíz: TÚ */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-base"
                style={{ background: 'rgba(0,245,255,0.12)', border: '2px solid rgba(0,245,255,0.5)', color: '#00F5FF', boxShadow: '0 0 20px rgba(0,245,255,0.25)' }}>
                <UserCircle className="w-7 h-7" style={{ color: '#00F5FF' }} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0f]"
                style={{ background: '#00FF88', boxShadow: '0 0 6px #00FF88' }} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest mt-2" style={{ color: '#00F5FF' }}>Tú</p>
          </div>

          {/* Niveles */}
          {levels.map((level, li) => {
            const cfg = getLevel(level.level)
            const maxVisible = 8
            const visible = level.members.slice(0, maxVisible)
            const extra = level.count - maxVisible

            return (
              <div key={level.level} className="flex flex-col items-center">
                {/* Conector vertical */}
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-4" style={{ background: `linear-gradient(to bottom, ${li === 0 ? 'rgba(0,245,255,0.5)' : cfg.color + '50'}, ${cfg.color}70)` }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                  <div className="w-px h-3" style={{ background: `${cfg.color}50` }} />
                </div>

                {/* Row de avatares */}
                <div className="w-full rounded-2xl px-4 py-3"
                  style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black"
                        style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                        {level.level}
                      </div>
                      <span className="text-[11px] font-bold" style={{ color: cfg.color }}>
                        {level.level === 1 ? 'Referidos directos' : `Nivel ${level.level}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.2)', color: '#00FF88' }}>
                        {level.active} activos
                      </span>
                      <span className="text-lg font-black" style={{ color: cfg.color }}>{level.count}</span>
                    </div>
                  </div>

                  {/* Avatares en fila */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {visible.map((m, mi) => (
                      <div key={mi} className="flex flex-col items-center gap-0.5 group/node">
                        <AvatarNode name={m.fullName} active={m.isActive} color={cfg.color} size={32} />
                      </div>
                    ))}
                    {extra > 0 && (
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black shrink-0"
                        style={{ background: `${cfg.color}15`, border: `1.5px dashed ${cfg.color}40`, color: cfg.color }}>
                        +{extra}
                      </div>
                    )}
                    {level.count === 0 && (
                      <p className="text-[10px] text-white/20">Sin miembros aún</p>
                    )}
                  </div>

                  {/* Barra de actividad */}
                  <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${level.count > 0 ? (level.active / level.count) * 100 : 0}%`, background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── DETALLE POR NIVEL (acordeón) ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Detalle por nivel</p>

        {levels.length === 0 ? (
          <div className="text-center py-14 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)' }}>
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-bold mb-1">Aún no tienes referidos</p>
            <p className="text-white/15 text-xs">Comparte tu link y empieza a construir tu red</p>
          </div>
        ) : (
          levels.map((level) => {
            const cfg = getLevel(level.level)
            const isExp = expanded.includes(level.level)
            const pct = level.count > 0 ? Math.round((level.active / level.count) * 100) : 0

            return (
              <div key={level.level} className="rounded-2xl overflow-hidden transition-all"
                style={{ border: `1px solid ${cfg.color}25`, background: `${cfg.color}05` }}>

                {/* Fila header */}
                <button
                  onClick={() => toggleLevel(level.level)}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-all hover:brightness-110"
                >
                  {/* Badge nivel */}
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0"
                    style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}35`, color: cfg.color }}>
                    N{level.level}
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-bold text-white">{level.level === 1 ? 'Referidos directos' : `Nivel ${level.level}`}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] font-bold" style={{ color: '#00FF88' }}>{level.active} activos</span>
                      <span className="text-[9px] text-white/25">·</span>
                      <span className="text-[9px] text-white/30">{level.count - level.active} inactivos</span>
                      <span className="text-[9px] text-white/25">·</span>
                      <span className="text-[9px] font-bold" style={{ color: cfg.color }}>{pct}% activación</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-2xl font-black" style={{ color: cfg.color }}>{level.count}</span>
                    {isExp
                      ? <ChevronUp size={14} className="text-white/30" />
                      : <ChevronDown size={14} className="text-white/30" />
                    }
                  </div>
                </button>

                {/* Barra de progreso */}
                <div className="h-px mx-4 rounded-full overflow-hidden bg-white/5">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}60, ${cfg.color})` }} />
                </div>

                {/* Lista de miembros */}
                {isExp && (
                  <div className="px-4 pb-4 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {level.members.map((m, mi) => (
                        <div key={mi}
                          className="flex items-center gap-2.5 py-2 px-3 rounded-xl transition-colors"
                          style={{ background: 'rgba(255,255,255,0.025)' }}>
                          <AvatarNode name={m.fullName} active={m.isActive} color={cfg.color} size={28} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white/80 truncate">{m.fullName}</p>
                            <p className="text-[10px] text-white/30 truncate">@{m.username}</p>
                          </div>
                          <span className="text-[9px] font-black uppercase shrink-0 px-1.5 py-0.5 rounded-full"
                            style={{
                              background: m.isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                              border: `1px solid ${m.isActive ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
                              color: m.isActive ? '#00FF88' : 'rgba(255,255,255,0.2)',
                            }}>
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

      {/* ── ACTIVIDAD GLOBAL ── */}
      {stats.totalNetwork > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: '#00FF88' }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Actividad de la red</p>
            </div>
            <span className="text-sm font-black" style={{ color: '#00FF88' }}>{activePct}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${activePct}%`, background: 'linear-gradient(90deg, #00C2FF, #00FF88)' }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <p className="text-[9px] text-white/25">{stats.totalActive} activos</p>
            <p className="text-[9px] text-white/25">{stats.totalNetwork - stats.totalActive} inactivos</p>
          </div>
        </div>
      )}

      {/* ── BONOS ── */}
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Bonos de patrocinio recibidos</p>

        {recentBonuses.length === 0 ? (
          <div className="text-center py-10 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <Gift className="w-6 h-6 text-white/15 mx-auto mb-2" />
            <p className="text-white/25 text-xs">Aún no tienes bonos registrados</p>
            <p className="text-white/15 text-[11px] mt-1">Cuando alguien de tu red active un plan recibirás el 20%</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden divide-y"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.05)' }}>
            {recentBonuses.map((bonus) => (
              <div key={bonus.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)' }}>
                  <Gift className="w-4 h-4" style={{ color: '#FFB800' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white/70 truncate">{bonus.description ?? 'Bono de patrocinio'}</p>
                  <p className="text-[10px] text-white/25">
                    {new Date(bonus.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-black shrink-0" style={{ color: '#FFB800' }}>+${bonus.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
