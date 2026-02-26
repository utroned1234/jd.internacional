'use client'

import { useState, useEffect, useMemo } from 'react'
import { Users, Copy, Check, TrendingUp, Network, DollarSign, Gift, Share2, UserCircle, Zap, Search, X } from 'lucide-react'

// ── Colores por nivel ─────────────────────────────────────────────────────────
const LEVEL_CFG = [
  { color: '#00F5FF', label: 'Referidos directos' },
  { color: '#FF2DF7', label: 'Nivel 2' },
  { color: '#9B00FF', label: 'Nivel 3' },
  { color: '#FFB800', label: 'Nivel 4' },
  { color: '#00FF88', label: 'Nivel 5' },
]

function getLevel(n: number) { return LEVEL_CFG[(n - 1) % LEVEL_CFG.length] }

// ── Types ─────────────────────────────────────────────────────────────────────
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
interface FlatMember {
  username: string
  fullName: string
  isActive: boolean
  level: number
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function AvatarNode({ name, active, color, size = 32 }: { name: string; active: boolean; color: string; size?: number }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-black text-white"
        style={{
          background: `${color}20`,
          border: `1.5px solid ${color}50`,
          fontSize: size > 32 ? 13 : 11,
          boxShadow: active ? `0 0 8px ${color}40` : 'none',
        }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
      <div
        className="absolute -bottom-0.5 -right-0.5 rounded-full border border-[#0a0a0f]"
        style={{ width: 8, height: 8, background: active ? '#00FF88' : 'rgba(255,255,255,0.15)' }}
      />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  const [data, setData] = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState<'all' | number>('all')

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

  // Flatten all members with their level
  const allMembers = useMemo<FlatMember[]>(() => {
    if (!data) return []
    return data.levels.flatMap(lv => lv.members.map(m => ({ ...m, level: lv.level })))
  }, [data])

  // Filtered members
  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase()
    return allMembers.filter(m => {
      const matchLevel = levelFilter === 'all' || m.level === levelFilter
      const matchSearch = !q || m.fullName.toLowerCase().includes(q) || m.username.toLowerCase().includes(q)
      return matchLevel && matchSearch
    })
  }, [allMembers, search, levelFilter])

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
          { label: 'Red total',  val: stats.totalNetwork,                     from: '#00F5FF', to: '#0066FF',  icon: Users },
          { label: 'Activos',    val: stats.totalActive,                      from: '#00FF88', to: '#00C2FF',  icon: TrendingUp },
          { label: 'Directos',   val: stats.directReferrals,                  from: '#FF2DF7', to: '#9B00FF',  icon: Network },
          { label: 'Comisiones', val: `$${stats.totalCommissions.toFixed(2)}`, from: '#FFB800', to: '#FF5C00', icon: DollarSign },
        ].map((s, i) => (
          <div key={i} className="relative rounded-2xl p-4 overflow-hidden border"
            style={{ background: `linear-gradient(135deg, ${s.from}12, ${s.to}08)`, borderColor: `${s.from}25` }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${s.from}80, transparent)` }} />
            <s.icon className="w-4 h-4 mb-2" style={{ color: s.from }} />
            <p className="text-2xl font-black tracking-tighter" style={{ color: s.from }}>{s.val}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/30">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── REFERRAL BANNER ── */}
      <div className="relative rounded-2xl overflow-hidden p-4"
        style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(155,0,255,0.06))', border: '1px solid rgba(0,245,255,0.15)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, transparent)' }} />
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

      {/* ── RESUMEN POR NIVELES ── */}
      {levels.length > 0 && (
        <div className="rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25 mb-5 text-center">Estructura por niveles</p>

          {/* YOU node */}
          <div className="flex flex-col items-center mb-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.12)', border: '2px solid rgba(0,245,255,0.5)', boxShadow: '0 0 20px rgba(0,245,255,0.2)' }}>
              <UserCircle className="w-6 h-6" style={{ color: '#00F5FF' }} />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest mt-1.5" style={{ color: '#00F5FF' }}>Tú</p>
          </div>

          {/* Level rows */}
          <div className="flex flex-col items-center">
            {levels.map((level) => {
              const cfg = getLevel(level.level)
              const pct = level.count > 0 ? (level.active / level.count) * 100 : 0
              return (
                <div key={level.level} className="flex flex-col items-center w-full max-w-md">
                  {/* Connector */}
                  <div className="flex flex-col items-center">
                    <div className="w-px h-3" style={{ background: `${cfg.color}50` }} />
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
                    <div className="w-px h-2" style={{ background: `${cfg.color}40` }} />
                  </div>
                  {/* Bar */}
                  <div className="w-full rounded-xl px-4 py-3 flex items-center gap-3"
                    style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0"
                      style={{ background: `${cfg.color}20`, border: `1px solid ${cfg.color}40`, color: cfg.color }}>
                      {level.level}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold" style={{ color: cfg.color }}>
                          {level.level === 1 ? 'Referidos directos' : `Nivel ${level.level}`}
                        </span>
                        <span className="text-base font-black" style={{ color: cfg.color }}>{level.count}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cfg.color}70, ${cfg.color})` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[9px]" style={{ color: '#00FF88' }}>{level.active} activos</span>
                        <span className="text-[9px] text-white/25">{level.count - level.active} inactivos</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TODA LA RED ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/25">Toda la red</p>
          <span className="text-[10px] text-white/30">{filteredMembers.length} miembros</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 rounded-xl text-sm text-white placeholder-white/25 focus:outline-none transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Level filter tabs */}
        {levels.length > 0 && (
          <div className="flex gap-1 flex-wrap">
            <button
              onClick={() => setLevelFilter('all')}
              className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
              style={{
                background: levelFilter === 'all' ? 'rgba(0,245,255,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${levelFilter === 'all' ? 'rgba(0,245,255,0.4)' : 'rgba(255,255,255,0.08)'}`,
                color: levelFilter === 'all' ? '#00F5FF' : 'rgba(255,255,255,0.3)',
              }}
            >
              Todos ({allMembers.length})
            </button>
            {levels.map(level => {
              const cfg = getLevel(level.level)
              const active = levelFilter === level.level
              return (
                <button
                  key={level.level}
                  onClick={() => setLevelFilter(level.level)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all"
                  style={{
                    background: active ? `${cfg.color}15` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${active ? `${cfg.color}40` : 'rgba(255,255,255,0.08)'}`,
                    color: active ? cfg.color : 'rgba(255,255,255,0.3)',
                  }}
                >
                  N{level.level} ({level.count})
                </button>
              )
            })}
          </div>
        )}

        {/* Member list */}
        {allMembers.length === 0 ? (
          <div className="text-center py-14 rounded-3xl"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)' }}>
              <Users className="w-6 h-6 text-white/20" />
            </div>
            <p className="text-white/30 text-sm font-bold mb-1">Aún no tienes referidos</p>
            <p className="text-white/15 text-xs">Comparte tu link y empieza a construir tu red</p>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-10 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.06)' }}>
            <p className="text-white/30 text-sm">Sin resultados para &ldquo;{search}&rdquo;</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {filteredMembers.map((m, i) => {
              const cfg = getLevel(m.level)
              return (
                <div key={`${m.level}-${m.username}-${i}`} className="flex items-center gap-3 px-4 py-3">
                  <AvatarNode name={m.fullName} active={m.isActive} color={cfg.color} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white/85 truncate">{m.fullName}</p>
                    <p className="text-[10px] text-white/30 truncate">@{m.username}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}30`, color: cfg.color }}>
                      N{m.level}
                    </span>
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full"
                      style={{
                        background: m.isActive ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${m.isActive ? 'rgba(0,255,136,0.25)' : 'rgba(255,255,255,0.08)'}`,
                        color: m.isActive ? '#00FF88' : 'rgba(255,255,255,0.2)',
                      }}>
                      {m.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
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
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
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
