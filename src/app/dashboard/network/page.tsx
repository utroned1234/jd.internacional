'use client'

import { useState, useEffect } from 'react'
import { Users, Copy, Check, DollarSign, Gift, Share2, TrendingUp, Zap, ArrowLeft, UserCircle2, ChevronRight, X, Crown, Network } from 'lucide-react'
import type { TreeNode } from '@/app/api/network/route'

// ── Tree line color ─────────────────────────────────────────────────────────
const LINE_COLOR = 'rgba(255,255,255,0.08)'

// ── CSS tree connectors ─────────────────────────────────────────────────────
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

// ── Plan labels ─────────────────────────────────────────────────────────────
const PLAN_LABEL: Record<string, string> = {
  NONE: 'Sin plan', BASIC: 'Pack Básico', PRO: 'Pack Pro', ELITE: 'Pack Elite',
}

// ── Detail modal ─────────────────────────────────────────────────────────────
function DetailModal({ node, onClose }: { node: TreeNode; onClose: () => void }) {
  const active = node.isActive
  const plan = PLAN_LABEL[node.plan] ?? 'Sin plan'

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden z-10 bg-[#111] border border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shrink-0 ${active ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'}`}>
            {node.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{node.fullName}</p>
            <p className="text-xs text-white/35 mt-0.5">@{node.username}</p>
            <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full mt-1.5 border ${active ? 'bg-emerald-400/8 border-emerald-400/20 text-emerald-400' : 'bg-red-400/8 border-red-400/20 text-red-400'}`}>
              {active ? 'Activo' : 'Inactivo'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/8 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        <div className="mx-5 h-px bg-white/6" />

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2.5 p-5">
          <div className="col-span-2 bg-white/[0.03] border border-white/8 rounded-xl p-3.5 flex items-center gap-3">
            <Crown size={14} className="text-white/30 shrink-0" />
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-widest">Plan adquirido</p>
              <p className="text-sm font-medium text-white/70 mt-0.5">{plan}</p>
            </div>
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
            <Network size={13} className="text-white/30 mb-2" />
            <p className="text-2xl font-semibold text-white/80">{node.directCount}</p>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mt-0.5">Directos</p>
          </div>
          <div className="bg-white/[0.03] border border-white/8 rounded-xl p-3.5">
            <p className="text-[9px] text-white/25 uppercase tracking-widest mb-2">Nivel</p>
            <p className="text-2xl font-semibold text-white/80">{node.level}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Child node card ──────────────────────────────────────────────────────────
function ChildCard({ node, onNavigate, onDetail }: { node: TreeNode; onNavigate: () => void; onDetail: () => void }) {
  const active = node.isActive
  return (
    <div className="flex flex-col items-center gap-1.5 select-none" style={{ width: 80 }}>
      <div
        className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-base font-semibold cursor-pointer transition-all active:scale-90 border ${active ? 'bg-emerald-400/8 border-emerald-400/20 text-emerald-400' : 'bg-white/[0.03] border-white/10 text-white/30'}`}
        onClick={onDetail}
      >
        {node.fullName.charAt(0).toUpperCase()}
        {/* Level badge */}
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-[8px] font-bold text-white/50">
          {node.level}
        </span>
      </div>
      <p className="text-[10px] font-medium text-white/60 text-center leading-tight w-full truncate px-1">
        {node.fullName.split(' ')[0]}
      </p>
      {node.directCount > 0 ? (
        <button
          onClick={onNavigate}
          className="text-[9px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 bg-white/5 border border-white/10 text-white/40 hover:text-white/60 transition-colors"
        >
          <ChevronRight size={8} /> {node.directCount}
        </button>
      ) : (
        <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/[0.02] border border-white/6 text-white/15">
          —
        </span>
      )}
    </div>
  )
}

// ── Root card ────────────────────────────────────────────────────────────────
function RootCard({ name, username, isActive, isYou }: { name: string; username: string; isActive: boolean; isYou: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-semibold border-2 ${isYou ? 'bg-white/5 border-white/20 text-white/70' : isActive ? 'bg-emerald-400/8 border-emerald-400/25 text-emerald-400' : 'bg-white/[0.03] border-white/12 text-white/30'}`}>
        {isYou ? <UserCircle2 size={32} /> : name.charAt(0).toUpperCase()}
        <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${isActive ? 'bg-emerald-400' : 'bg-red-400/70'}`} />
      </div>
      <p className="text-sm font-medium text-white/70 mt-0.5">
        {isYou ? name : name.split(' ')[0]}
      </p>
      <p className="text-[10px] text-white/25">
        @{username}{isYou ? ' · Tú' : ''}
      </p>
    </div>
  )
}

// ── Network types ─────────────────────────────────────────────────────────────
interface BonusEntry { id: string; amount: number; description: string | null; createdAt: string }
interface NetworkData {
  referralCode: string
  user: { fullName: string; username: string; isActive: boolean }
  tree: TreeNode[]
  stats: { directReferrals: number; totalNetwork: number; totalActive: number; totalCommissions: number }
  recentBonuses: BonusEntry[]
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  const [data, setData]     = useState<NetworkData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [path, setPath]     = useState<TreeNode[]>([])
  const [detail, setDetail] = useState<TreeNode | null>(null)
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
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-sm text-white/25">Error al cargar la red</p>
      </div>
    )
  }

  const { stats, tree, referralCode, recentBonuses, user } = data
  const activePct       = stats.totalNetwork > 0 ? Math.round((stats.totalActive / stats.totalNetwork) * 100) : 0
  const currentNode     = path[path.length - 1] ?? null
  const currentChildren = currentNode ? currentNode.children : tree

  return (
    <div className="px-4 md:px-6 pt-6 max-w-2xl mx-auto pb-24 text-white space-y-4">
      <style>{TREE_CSS}</style>

      {detail && <DetailModal node={detail} onClose={() => setDetail(null)} />}

      {/* ── HEADER ── */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Users size={18} className="text-white/40" /> Mi Red
        </h1>
        <p className="text-sm text-white/30 mt-0.5">
          {stats.totalNetwork} miembros · {stats.totalActive} activos
        </p>
      </div>

      {/* ── STATS ── */}
      <div className="grid grid-cols-2 gap-3">
        {([
          { label: 'Red total',  val: stats.totalNetwork,                      Icon: Users },
          { label: 'Activos',    val: stats.totalActive,                       Icon: TrendingUp },
          { label: 'Directos',   val: stats.directReferrals,                   Icon: Zap },
          { label: 'Comisiones', val: `$${stats.totalCommissions.toFixed(2)}`, Icon: DollarSign },
        ] as const).map((s, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 flex flex-col gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
              <s.Icon size={14} className="text-white/35" />
            </div>
            <div>
              <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium mb-0.5">{s.label}</p>
              <p className="text-xl font-semibold text-white/85">{s.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── REFERRAL LINK ── */}
      <div className="bg-white/[0.03] border border-white/8 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Share2 size={13} className="text-white/35" />
          <p className="text-xs font-medium text-white/40 uppercase tracking-widest">Tu link de referido</p>
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/8 text-white/35">
            {referralCode}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-xl px-3 py-2 font-mono text-xs truncate bg-white/[0.02] border border-white/6 text-white/25">
            {baseUrl}/register?ref={referralCode}
          </div>
          <button
            onClick={copyLink}
            className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium uppercase tracking-wider transition-all active:scale-95 border ${copied ? 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' : 'bg-white/5 border-white/10 text-white/50 hover:text-white/70'}`}
          >
            {copied ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
          </button>
        </div>
      </div>

      {/* ── ÁRBOL GENEALÓGICO ── */}
      <div className="bg-white/[0.02] border border-white/8 rounded-2xl overflow-hidden">
        {/* Title */}
        <div className="px-4 py-3 flex items-center gap-2 border-b border-white/6">
          <p className="text-xs font-medium text-white/30 uppercase tracking-widest flex-1">Árbol genealógico</p>
          <span className="text-[10px] text-white/15">Toca el avatar para ver detalles</span>
        </div>

        {/* Breadcrumb */}
        {path.length > 0 && (
          <div className="px-4 pt-3 flex items-center gap-1 flex-wrap">
            <button
              onClick={() => setPath([])}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-white/5 border border-white/8 text-white/40 hover:text-white/60 transition-colors"
            >
              <ArrowLeft size={10} /> Tú
            </button>
            {path.map((node, idx) => (
              <div key={node.id} className="flex items-center gap-1">
                <ChevronRight size={10} className="text-white/15" />
                <button
                  onClick={() => setPath(p => p.slice(0, idx + 1))}
                  className={`text-[10px] px-2 py-1 rounded-lg transition-colors border ${idx === path.length - 1 ? 'bg-white/5 border-white/10 text-white/60' : 'border-transparent text-white/30'}`}
                >
                  {node.fullName.split(' ')[0]}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tree */}
        <div className="p-5 overflow-x-auto">
          <div className="flex flex-col items-center" style={{ minWidth: 'max-content', margin: '0 auto' }}>
            <RootCard
              name={currentNode ? currentNode.fullName : user.fullName}
              username={currentNode ? currentNode.username : user.username}
              isActive={currentNode ? currentNode.isActive : user.isActive}
              isYou={!currentNode}
            />

            {currentChildren.length === 0 ? (
              <div className="mt-8 text-center px-6 py-8 rounded-2xl bg-white/[0.015] border border-dashed border-white/6" style={{ minWidth: 260 }}>
                <Users size={18} className="text-white/10 mx-auto mb-3" />
                <p className="text-white/25 text-sm">
                  {!currentNode ? 'Aún no tienes referidos' : 'Sin referidos directos'}
                </p>
                <p className="text-white/15 text-xs mt-1">
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
          <div className="px-4 pb-4 pt-3 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/[0.04]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
              <span className="text-[9px] text-white/25">Activo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/15" />
              <span className="text-[9px] text-white/25">Inactivo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-white/8 border border-white/12 flex items-center justify-center text-[7px] text-white/40">N</span>
              <span className="text-[9px] text-white/25">Número de nivel</span>
            </div>
          </div>
        )}
      </div>

      {/* ── ACTIVIDAD ── */}
      {stats.totalNetwork > 0 && (
        <div className="bg-white/[0.02] border border-white/8 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-medium text-white/35 uppercase tracking-widest">Actividad de la red</p>
            <span className="text-sm font-semibold text-white/60">{activePct}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/5">
            <div
              className="h-full rounded-full bg-white/30 transition-all duration-1000"
              style={{ width: `${activePct}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-[10px] text-white/20">{stats.totalActive} activos</p>
            <p className="text-[10px] text-white/20">{stats.totalNetwork - stats.totalActive} inactivos</p>
          </div>
        </div>
      )}

      {/* ── BONOS ── */}
      <div className="space-y-2.5">
        <p className="text-xs font-medium text-white/25 uppercase tracking-widest">Bonos recibidos</p>
        {recentBonuses.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white/[0.015] border border-dashed border-white/6">
            <Gift size={20} className="mx-auto mb-2 text-white/10" />
            <p className="text-white/20 text-xs">Aún no tienes bonos registrados</p>
            <p className="text-white/12 text-[11px] mt-1">Cuando alguien active un plan recibirás el 20%</p>
          </div>
        ) : (
          <div className="rounded-2xl overflow-hidden divide-y divide-white/[0.04] bg-white/[0.02] border border-white/8">
            {recentBonuses.map(bonus => (
              <div key={bonus.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-white/5 border border-white/8">
                  <Gift size={13} className="text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white/55 truncate">{bonus.description ?? 'Bono de patrocinio'}</p>
                  <p className="text-[10px] text-white/20 mt-0.5">
                    {new Date(bonus.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-sm font-semibold text-white/70 shrink-0">+${bonus.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
