'use client'

import { useState, useEffect } from 'react'
import { Users, Copy, Check, DollarSign, Gift, Share2, TrendingUp, Zap, ArrowLeft, UserCircle2, ChevronRight, X, Crown, Network } from 'lucide-react'
import type { TreeNode } from '@/app/api/network/route'

// ── Level colors ───────────────────────────────────────────────────────────────
const LEVELS = ['#00F5FF', '#FF2DF7', '#9B00FF', '#FFB800', '#00FF88']
const LINE_COLOR = 'rgba(0,245,255,0.22)'
function lvlColor(n: number) { return LEVELS[(n - 1) % LEVELS.length] }

// ── Plan config ────────────────────────────────────────────────────────────────
const PLAN_CFG: Record<string, { label: string; color: string }> = {
  NONE:  { label: 'Sin plan',    color: 'rgba(255,255,255,0.25)' },
  BASIC: { label: 'Pack Básico', color: '#00F5FF' },
  PRO:   { label: 'Pack Pro',    color: '#9B00FF' },
  ELITE: { label: 'Pack Elite',  color: '#FFB800' },
}

// ── CSS tree connectors ────────────────────────────────────────────────────────
const TREE_CSS = `
.mlm-children {
  display: flex; flex-wrap: nowrap; position: relative;
  padding-top: 28px; margin: 0; list-style: none; gap: 8px;
}
.mlm-children::before {
  content: ''; position: absolute; top: 0; left: 50%;
  width: 0; height: 28px; border-left: 1.5px solid ${LINE_COLOR};
}
.mlm-child {
  display: flex; flex-direction: column; align-items: center;
  position: relative; padding-top: 28px; min-width: 80px; flex: 1;
}
.mlm-child::before, .mlm-child::after {
  content: ''; position: absolute; top: 0; height: 28px;
}
.mlm-child::before { right: 50%; width: 50%; border-top: 1.5px solid ${LINE_COLOR}; }
.mlm-child::after  { left: 50%;  width: 50%; border-top: 1.5px solid ${LINE_COLOR}; border-left: 1.5px solid ${LINE_COLOR}; }
.mlm-child:only-child::before, .mlm-child:only-child::after { display: none; }
.mlm-child:first-child::before { border: none; }
.mlm-child:last-child::after   { border-left: none; }
.mlm-child:last-child::before  { border-right: 1.5px solid ${LINE_COLOR}; border-radius: 0 5px 0 0; }
.mlm-child:first-child::after  { border-radius: 5px 0 0 0; }
`

// ── Detail modal ───────────────────────────────────────────────────────────────
function DetailModal({ node, onClose }: { node: TreeNode; onClose: () => void }) {
  const color  = lvlColor(node.level)
  const plan   = PLAN_CFG[node.plan] ?? PLAN_CFG.NONE
  const active = node.isActive

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden z-10"
        style={{ background: '#0f0f1a', border: `1px solid ${color}30`, boxShadow: `0 0 60px ${color}20` }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${color}90, transparent)` }} />

        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-center gap-4">
          {/* Square avatar */}
          <div className="relative shrink-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black"
              style={{
                background: active ? 'rgba(0,255,136,0.12)' : 'rgba(239,68,68,0.12)',
                border: `2.5px solid ${active ? 'rgba(0,255,136,0.5)' : 'rgba(239,68,68,0.5)'}`,
                color: active ? '#00FF88' : '#ef4444',
                boxShadow: active ? '0 0 20px rgba(0,255,136,0.25)' : '0 0 20px rgba(239,68,68,0.25)',
              }}
            >
              {node.fullName.charAt(0).toUpperCase()}
            </div>
            {/* Status badge */}
            <span
              className="absolute -bottom-1 -right-1 text-[8px] font-black px-1.5 py-0.5 rounded-full border"
              style={{
                background: active ? 'rgba(0,255,136,0.15)' : 'rgba(239,68,68,0.15)',
                borderColor: active ? 'rgba(0,255,136,0.4)' : 'rgba(239,68,68,0.4)',
                color: active ? '#00FF88' : '#ef4444',
              }}
            >
              {active ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-white truncate">{node.fullName}</p>
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>@{node.username}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}>
                Nivel {node.level}
              </span>
            </div>
          </div>

          <button onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <X size={14} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 p-6">

          {/* Plan */}
          <div className="col-span-2 rounded-2xl p-4 flex items-center gap-3"
            style={{ background: `${plan.color === 'rgba(255,255,255,0.25)' ? 'rgba(255,255,255,0.04)' : plan.color + '12'}`, border: `1px solid ${plan.color === 'rgba(255,255,255,0.25)' ? 'rgba(255,255,255,0.08)' : plan.color + '35'}` }}>
            <Crown size={16} style={{ color: plan.color }} />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>Plan adquirido</p>
              <p className="text-sm font-black mt-0.5" style={{ color: plan.color }}>{plan.label}</p>
            </div>
          </div>

          {/* Direct referrals */}
          <div className="rounded-2xl p-4"
            style={{ background: `${color}0D`, border: `1px solid ${color}25` }}>
            <Network size={14} className="mb-2" style={{ color }} />
            <p className="text-2xl font-black tracking-tighter" style={{ color }}>{node.directCount}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/25">Referidos directos</p>
          </div>

          {/* Status */}
          <div className="rounded-2xl p-4"
            style={{
              background: active ? 'rgba(0,255,136,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${active ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)'}`,
            }}>
            <div className="w-3.5 h-3.5 rounded-sm mb-2"
              style={{ background: active ? '#00FF88' : '#ef4444', boxShadow: active ? '0 0 8px #00FF88' : '0 0 8px #ef4444' }} />
            <p className="text-sm font-black" style={{ color: active ? '#00FF88' : '#ef4444' }}>
              {active ? 'Activo' : 'Inactivo'}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/25">Estado</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Child node card ────────────────────────────────────────────────────────────
function ChildCard({ node, onNavigate, onDetail }: { node: TreeNode; onNavigate: () => void; onDetail: () => void }) {
  const color  = lvlColor(node.level)
  const active = node.isActive

  return (
    <div className="flex flex-col items-center gap-1.5 select-none" style={{ width: 80 }}>

      {/* Square avatar */}
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black cursor-pointer transition-all active:scale-90 relative"
        style={{
          background: active ? 'rgba(0,255,136,0.1)' : 'rgba(239,68,68,0.1)',
          border: `2px solid ${active ? 'rgba(0,255,136,0.45)' : 'rgba(239,68,68,0.45)'}`,
          color: active ? '#00FF88' : '#ef4444',
          boxShadow: active ? '0 0 14px rgba(0,255,136,0.25)' : '0 0 14px rgba(239,68,68,0.2)',
        }}
        onClick={onDetail}
      >
        {node.fullName.charAt(0).toUpperCase()}

        {/* Level dot top-right */}
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black border border-[#0b0b14]"
          style={{ background: color, color: '#000', boxShadow: `0 0 6px ${color}80` }}
        >
          {node.level}
        </span>
      </div>

      {/* Name */}
      <p className="text-[10px] font-bold text-center leading-tight w-full truncate px-1"
        style={{ color: 'rgba(255,255,255,0.8)' }}>
        {node.fullName.split(' ')[0]}
      </p>

      {/* Sub-refs button or label */}
      {node.directCount > 0 ? (
        <button
          onClick={onNavigate}
          className="text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 transition-all active:scale-95"
          style={{ background: `${color}15`, border: `1px solid ${color}35`, color }}
        >
          <ChevronRight size={8} /> {node.directCount} refs
        </button>
      ) : (
        <span className="text-[8px] px-1.5 py-0.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.2)' }}>
          sin refs
        </span>
      )}
    </div>
  )
}

// ── Root card (large, always "Tú" or selected person) ─────────────────────────
function RootCard({ name, username, isActive, color, isYou }: { name: string; username: string; isActive: boolean; color: string; isYou: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative">
        {isYou && (
          <div className="absolute inset-0 rounded-3xl animate-ping opacity-15"
            style={{ background: color, animationDuration: '2.5s' }} />
        )}
        <div
          className="relative w-20 h-20 rounded-3xl flex items-center justify-center text-2xl font-black"
          style={{
            background: isYou ? `${color}18` : (isActive ? 'rgba(0,255,136,0.12)' : 'rgba(239,68,68,0.12)'),
            border: `3px solid ${isYou ? color + '70' : (isActive ? 'rgba(0,255,136,0.5)' : 'rgba(239,68,68,0.5)')}`,
            color: isYou ? color : (isActive ? '#00FF88' : '#ef4444'),
            boxShadow: `0 0 30px ${isYou ? color + '30' : (isActive ? 'rgba(0,255,136,0.2)' : 'rgba(239,68,68,0.2)')}`,
          }}
        >
          {isYou ? <UserCircle2 size={34} /> : name.charAt(0).toUpperCase()}
        </div>
        {/* Active/inactive indicator */}
        <span
          className="absolute -bottom-1 -right-1 text-[9px] font-black px-1.5 py-0.5 rounded-full border"
          style={{
            background: isActive ? 'rgba(0,255,136,0.15)' : 'rgba(239,68,68,0.15)',
            borderColor: isActive ? 'rgba(0,255,136,0.4)' : 'rgba(239,68,68,0.4)',
            color: isActive ? '#00FF88' : '#ef4444',
          }}
        >
          {isActive ? 'Activo' : 'Inactivo'}
        </span>
      </div>
      <p className="text-sm font-black mt-1" style={{ color: isYou ? color : (isActive ? '#00FF88' : '#ef4444') }}>
        {isYou ? name : name.split(' ')[0]}
      </p>
      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
        @{username}{isYou ? ' · Tú' : ''}
      </p>
    </div>
  )
}

// ── Network types ──────────────────────────────────────────────────────────────
interface BonusEntry { id: string; amount: number; description: string | null; createdAt: string }
interface NetworkData {
  referralCode: string
  user: { fullName: string; username: string; isActive: boolean }
  tree: TreeNode[]
  stats: { directReferrals: number; totalNetwork: number; totalActive: number; totalCommissions: number }
  recentBonuses: BonusEntry[]
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  const [data, setData]       = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied]   = useState(false)
  const [path, setPath]       = useState<TreeNode[]>([])
  const [detail, setDetail]   = useState<TreeNode | null>(null)
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
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.25)' }}>Error al cargar la red</p>
      </div>
    )
  }

  const { stats, tree, referralCode, recentBonuses, user } = data
  const activePct       = stats.totalNetwork > 0 ? Math.round((stats.totalActive / stats.totalNetwork) * 100) : 0
  const currentNode     = path[path.length - 1] ?? null
  const currentChildren = currentNode ? currentNode.children : tree
  const rootColor       = currentNode ? lvlColor(currentNode.level) : '#00F5FF'

  return (
    <div className="px-4 md:px-6 pt-6 max-w-2xl mx-auto pb-24 text-white space-y-5">
      <style>{TREE_CSS}</style>

      {/* Detail modal */}
      {detail && <DetailModal node={detail} onClose={() => setDetail(null)} />}

      {/* ── HEADER ── */}
      <div>
        <h1 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
          <Users size={18} style={{ color: '#00F5FF' }} /> Mi Red Unilevel
        </h1>
        <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {stats.totalNetwork} miembros · {stats.totalActive} activos
        </p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { label: 'Red total',  val: stats.totalNetwork,                      color: '#00F5FF', Icon: Users },
          { label: 'Activos',    val: stats.totalActive,                       color: '#00FF88', Icon: TrendingUp },
          { label: 'Directos',   val: stats.directReferrals,                   color: '#FF2DF7', Icon: Zap },
          { label: 'Comisiones', val: `$${stats.totalCommissions.toFixed(2)}`, color: '#FFB800', Icon: DollarSign },
        ] as const).map((s, i) => (
          <div key={i} className="relative rounded-2xl p-4 overflow-hidden"
            style={{ background: `${s.color}0D`, border: `1px solid ${s.color}28` }}>
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${s.color}80, transparent)` }} />
            <s.Icon size={14} className="mb-2" style={{ color: s.color }} />
            <p className="text-2xl font-black tracking-tighter" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[9px] font-bold uppercase tracking-widest mt-0.5 text-white/25">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── REFERRAL LINK ── */}
      <div className="relative rounded-2xl p-4 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.05), rgba(155,0,255,0.05))', border: '1px solid rgba(0,245,255,0.15)' }}>
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, transparent)' }} />
        <div className="flex items-center gap-2 mb-2.5">
          <Share2 size={12} style={{ color: '#00F5FF' }} />
          <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#00F5FF' }}>Tu link de referido</p>
          <span className="ml-auto text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.25)', color: '#00F5FF' }}>
            {referralCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-xl px-3 py-2 font-mono text-xs truncate"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }}>
            {baseUrl}/register?ref={referralCode}
          </div>
          <button onClick={copyLink}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95"
            style={{
              background: copied ? 'rgba(0,255,136,0.15)' : 'rgba(0,245,255,0.12)',
              border: `1px solid ${copied ? 'rgba(0,255,136,0.35)' : 'rgba(0,245,255,0.3)'}`,
              color: copied ? '#00FF88' : '#00F5FF',
            }}>
            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* ── ÁRBOL GENEALÓGICO ── */}
      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.07)' }}>

        {/* Title */}
        <div className="px-4 py-3 flex items-center gap-2"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex-1">Árbol genealógico</p>
          <span className="text-[9px] text-white/15">Toca el avatar para ver detalles</span>
        </div>

        {/* Breadcrumb */}
        {path.length > 0 && (
          <div className="px-4 pt-3 flex items-center gap-1 flex-wrap">
            <button onClick={() => setPath([])}
              className="flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg"
              style={{ color: '#00F5FF', background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.2)' }}>
              <ArrowLeft size={10} /> Tú
            </button>
            {path.map((node, idx) => (
              <div key={node.id} className="flex items-center gap-1">
                <ChevronRight size={10} style={{ color: 'rgba(255,255,255,0.2)' }} />
                <button
                  onClick={() => setPath(p => p.slice(0, idx + 1))}
                  className="text-[10px] font-black px-2 py-1 rounded-lg transition-colors"
                  style={{
                    color: idx === path.length - 1 ? lvlColor(node.level) : 'rgba(255,255,255,0.4)',
                    background: idx === path.length - 1 ? `${lvlColor(node.level)}12` : 'transparent',
                    border: idx === path.length - 1 ? `1px solid ${lvlColor(node.level)}30` : '1px solid transparent',
                  }}>
                  {node.fullName.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tree */}
        <div className="p-5 overflow-x-auto">
          <div className="flex flex-col items-center" style={{ minWidth: 'max-content', margin: '0 auto' }}>

            {/* Root */}
            <RootCard
              name={currentNode ? currentNode.fullName : user.fullName}
              username={currentNode ? currentNode.username : user.username}
              isActive={currentNode ? currentNode.isActive : user.isActive}
              color={rootColor}
              isYou={!currentNode}
            />

            {/* Empty */}
            {currentChildren.length === 0 ? (
              <div className="mt-8 text-center px-6 py-8 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.015)', border: '1px dashed rgba(255,255,255,0.08)', minWidth: 260 }}>
                <div className="w-11 h-11 rounded-2xl flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(0,245,255,0.05)', border: '1px solid rgba(0,245,255,0.1)' }}>
                  <Users size={18} className="text-white/15" />
                </div>
                <p className="text-white/30 text-sm font-bold mb-1">
                  {!currentNode ? 'Aún no tienes referidos' : 'Sin referidos directos'}
                </p>
                <p className="text-white/15 text-xs">
                  {!currentNode ? 'Comparte tu link y empieza a construir tu red' : 'Esta persona todavía no ha referido a nadie'}
                </p>
              </div>
            ) : (
              <ul className="mlm-children">
                {currentChildren.map(node => (
                  <li key={node.id} className="mlm-child">
                    <ChildCard
                      node={node}
                      onNavigate={() => setPath(p => [...p, node])}
                      onDetail={() => setDetail(node)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Legend */}
        {stats.totalNetwork > 0 && (
          <div className="px-4 pb-4 pt-3 flex flex-wrap gap-x-3 gap-y-1.5"
            style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(0,255,136,0.6)', border: '1px solid rgba(0,255,136,0.6)' }} />
              <span className="text-[9px] font-bold text-white/25">Activo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm" style={{ background: 'rgba(239,68,68,0.6)', border: '1px solid rgba(239,68,68,0.6)' }} />
              <span className="text-[9px] font-bold text-white/25">Inactivo</span>
            </div>
            {LEVELS.map((color, i) => (
              <div key={i} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color, boxShadow: `0 0 5px ${color}60` }} />
                <span className="text-[9px] font-bold text-white/20">N{i + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── ACTIVIDAD ── */}
      {stats.totalNetwork > 0 && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Zap size={14} style={{ color: '#00FF88' }} />
              <p className="text-[10px] font-black uppercase tracking-widest text-white/35">Actividad de la red</p>
            </div>
            <span className="text-sm font-black" style={{ color: '#00FF88' }}>{activePct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
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
            <Gift size={22} className="mx-auto mb-2 text-white/15" />
            <p className="text-white/25 text-xs">Aún no tienes bonos registrados</p>
            <p className="text-white/15 text-[11px] mt-1">Cuando alguien active un plan recibirás el 20%</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.04]"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {recentBonuses.map(bonus => (
              <div key={bonus.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)' }}>
                  <Gift size={14} style={{ color: '#FFB800' }} />
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
