'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Loader2, ExternalLink, RefreshCw, BarChart3, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const STATUS_LABELS: Record<string, { label: string; color: string; dot: string }> = {
    DRAFT: { label: 'Borrador', color: 'text-white/50 bg-white/5 border-white/10', dot: 'bg-white/30' },
    READY: { label: 'Listo', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', dot: 'bg-blue-400' },
    PUBLISHING: { label: 'Publicando', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20', dot: 'bg-yellow-400 animate-pulse' },
    PUBLISHED: { label: 'Publicado', color: 'text-green-400 bg-green-500/10 border-green-500/20', dot: 'bg-green-400' },
    FAILED: { label: 'Error', color: 'text-red-400 bg-red-500/10 border-red-500/20', dot: 'bg-red-400' },
    PAUSED: { label: 'Pausado', color: 'text-orange-400 bg-orange-500/10 border-orange-500/20', dot: 'bg-orange-400' },
}

const PLATFORM_META = { letter: 'f', color: '#0081FB', text: 'text-blue-400' }
const PLATFORM_TIKTOK = { letter: 'T', color: '#EE1D52', text: 'text-red-400' }
const PLATFORM_GOOGLE = { letter: 'G', color: '#4285F4', text: 'text-yellow-400' }
const PLATFORM_MAP: Record<string, typeof PLATFORM_META> = {
    META: PLATFORM_META, TIKTOK: PLATFORM_TIKTOK, GOOGLE_ADS: PLATFORM_GOOGLE
}

const FILTERS = ['ALL', 'DRAFT', 'READY', 'PUBLISHED', 'PAUSED', 'FAILED']
const FILTER_LABELS: Record<string, string> = {
    ALL: 'Todas', DRAFT: 'Borrador', READY: 'Listo',
    PUBLISHED: 'Publicadas', PAUSED: 'Pausadas', FAILED: 'Fallidas'
}

export default function HistoryPage() {
    const [campaigns, setCampaigns] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('ALL')
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => { fetchCampaigns() }, [])

    async function fetchCampaigns(showRefreshing = false) {
        if (showRefreshing) setRefreshing(true)
        else setLoading(true)
        try {
            const res = await fetch('/api/ads/campaign')
            const data = await res.json()
            setCampaigns(data.campaigns || [])
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const filtered = filter === 'ALL' ? campaigns : campaigns.filter(c => c.status === filter)

    return (
        <div className="px-4 md:px-6 pt-6 max-w-4xl mx-auto pb-24 text-white">

            {/* Header */}
            <div className="flex items-center gap-3 mb-7">
                <Link href="/dashboard/services/ads"
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shrink-0">
                    <ArrowLeft size={15} />
                </Link>
                <div className="flex-1 min-w-0">
                    <h1 className="text-lg md:text-xl font-black uppercase tracking-tighter">Historial de Campañas</h1>
                    <p className="text-[11px] text-white/30">{campaigns.length} campañas en total</p>
                </div>
                <button
                    onClick={() => fetchCampaigns(true)}
                    className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shrink-0">
                    <RefreshCw size={14} className={refreshing ? 'animate-spin text-purple-400' : ''} />
                </button>
            </div>

            {/* Filters — horizontal scroll on mobile */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 md:flex-wrap">
                {FILTERS.map(s => {
                    const count = s === 'ALL' ? campaigns.length : campaigns.filter(c => c.status === s).length
                    return (
                        <button key={s} onClick={() => setFilter(s)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border whitespace-nowrap shrink-0 ${filter === s
                                ? 'bg-white text-black border-white'
                                : 'bg-white/5 border-white/10 text-white/40 hover:border-white/25 hover:text-white/70'
                            }`}>
                            {FILTER_LABELS[s]}
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${filter === s ? 'bg-black/10' : 'bg-white/8'}`}>
                                {count}
                            </span>
                        </button>
                    )
                })}
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="animate-spin text-purple-400" size={28} />
                    <p className="text-white/30 text-sm">Cargando campañas...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 bg-white/[0.015] border border-dashed border-white/8 rounded-3xl">
                    <BarChart3 size={28} className="text-white/20 mx-auto mb-3" />
                    <p className="text-white/30 text-sm font-bold">Sin campañas</p>
                    <p className="text-white/20 text-xs mt-1">No hay campañas con este filtro</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((campaign: any) => {
                        const status = STATUS_LABELS[campaign.status] || STATUS_LABELS['DRAFT']
                        const plat = PLATFORM_MAP[campaign.platform]
                        const creativesWithMedia = campaign.creatives?.filter((c: any) => c.mediaUrl).length || 0

                        return (
                            <div key={campaign.id}
                                className="bg-white/3 border border-white/8 rounded-2xl p-4 md:p-5 hover:border-white/15 transition-all">

                                {/* Top row */}
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        {plat && <span className={`font-black text-base ${plat.text}`}>{plat.letter}</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start gap-2 justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm leading-tight line-clamp-1">{campaign.name}</h4>
                                                <p className="text-[11px] text-white/30 truncate mt-0.5">
                                                    {campaign.strategy?.name}{campaign.brief?.name ? ` · ${campaign.brief.name}` : ''}
                                                </p>
                                            </div>
                                            <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${status.color}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                {status.label}
                                            </span>
                                        </div>

                                        {/* Meta info chips */}
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                                            {campaign.dailyBudgetUSD > 0 && (
                                                <span className="text-[10px] text-white/25 font-medium">${campaign.dailyBudgetUSD}/día</span>
                                            )}
                                            <span className="text-[10px] text-white/25">{campaign.creatives?.length || 0} anuncios · {creativesWithMedia} con creativo</span>
                                            {campaign.publishedAt && (
                                                <span className="text-[10px] text-white/20">
                                                    {new Date(campaign.publishedAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Failure reason */}
                                {campaign.status === 'FAILED' && campaign.failureReason && (
                                    <div className="mt-3 p-3 bg-red-500/5 border border-red-500/15 rounded-xl flex items-start gap-2">
                                        <AlertCircle size={13} className="text-red-400/70 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-red-400/70">{campaign.failureReason}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
                                    {campaign.status === 'READY' && (
                                        <Link href={`/dashboard/services/ads/preview/${campaign.id}`}
                                            className="flex-1 sm:flex-none text-center text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all">
                                            Publicar →
                                        </Link>
                                    )}
                                    {campaign.status === 'DRAFT' && (
                                        <Link href={`/dashboard/services/ads/campaign/${campaign.strategyId}?edit=${campaign.id}`}
                                            className="flex-1 sm:flex-none text-center text-xs font-bold px-4 py-2 rounded-xl bg-white/8 text-white/60 hover:bg-white/15 transition-all">
                                            Continuar editando →
                                        </Link>
                                    )}
                                    {campaign.status === 'FAILED' && (
                                        <Link href={`/dashboard/services/ads/preview/${campaign.id}`}
                                            className="flex-1 sm:flex-none text-center text-xs font-bold px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                                            Reintentar
                                        </Link>
                                    )}
                                    {campaign.status === 'PUBLISHED' && campaign.providerCampaignId && (
                                        <a href="https://business.facebook.com/adsmanager" target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all">
                                            <ExternalLink size={12} /> Ver en Ads Manager
                                        </a>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
