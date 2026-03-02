'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, TrendingUp, UserCircle, CreditCard, DollarSign, Settings, LogOut, Camera } from 'lucide-react'

interface DashboardData {
  user: {
    fullName: string
    username: string
    referralCode: string
    isActive: boolean
    avatarUrl?: string | null
    rank?: string
  }
  stats: {
    directReferrals: number
    totalNetwork: number
    totalActive: number
    totalCommissions: number
    pendingBalance: number
  }
}

const backgroundImages = [
  'https://i.ibb.co/ksmGqK0R/estrategia-metaverso-de-meta-2025-detalle2-1024x573.jpg',
  'https://i.ibb.co/Z1vWB05C/estrategia-metaverso-de-meta-2025-detalle1-1024x573.jpg',
  'https://i.ibb.co/cK5Wv5yG/estrategia-metaverso-de-meta-2025.jpg',
]

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [avatarError, setAvatarError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/network')
      if (res.status === 401) { router.push('/login'); return }
      const networkData = await res.json()
      if (networkData?.user) setData(networkData)
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !data) return
    setAvatarError('')
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await fetch('/api/users/avatar', { method: 'POST', body: formData })
      const json = await res.json()
      if (!res.ok) { setAvatarError(json.error || 'Error al subir'); return }
      setData(prev => prev ? { ...prev, user: { ...prev.user, avatarUrl: json.avatarUrl } } : prev)
    } catch {
      setAvatarError('Error de conexión')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/30 text-sm">
        Error al cargar datos
      </div>
    )
  }

  const stats = [
    { icon: Users,      label: 'Mi Red',     value: data.stats.totalNetwork },
    { icon: TrendingUp, label: 'Directos',   value: data.stats.directReferrals },
    { icon: DollarSign, label: 'Comisiones', value: `$${data.stats.totalCommissions.toFixed(2)}` },
    { icon: CreditCard, label: 'Disponible', value: `$${data.stats.pendingBalance.toFixed(2)}` },
  ]

  return (
    <div className="min-h-screen pb-24">

      {/* ── BANNER ── */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-black">
        <img
          src={backgroundImages[currentImageIndex]}
          alt=""
          className="w-full h-full object-cover opacity-30 transition-opacity duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <Link
          href="/dashboard/settings"
          className="absolute top-4 left-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
        >
          <Settings className="w-4 h-4" />
        </Link>
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/30 hover:text-white/80 hover:border-white/20 transition-all backdrop-blur-sm"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* ── AVATAR + NOMBRE ── */}
      <div className="flex flex-col items-center -mt-14 sm:-mt-16 px-4 pb-8">
        {/* Avatar */}
        <div className="relative group/avatar mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            onChange={handleAvatarUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-[#111] border-2 border-white/15 shadow-xl block"
          >
            {data.user.avatarUrl ? (
              <img src={data.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-full h-full text-white/15 group-hover/avatar:text-white/25 transition-colors" />
            )}
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${uploading ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}>
              {uploading
                ? <div className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                : <><Camera className="w-5 h-5 text-white/60" /><span className="text-[9px] text-white/40 uppercase tracking-widest">Cambiar</span></>
              }
            </div>
          </button>
          {/* Indicador activo */}
          <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${data.user.isActive ? 'bg-emerald-400' : 'bg-red-500/70'}`} />
        </div>

        {avatarError && (
          <p className="text-xs text-red-400/80 mb-3">{avatarError}</p>
        )}

        {/* Nombre y usuario */}
        <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide text-center leading-tight">
          {data.user.fullName}
        </h1>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm text-white/40 tracking-wider">@{data.user.username}</span>
          {data.user.rank && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-xs text-white/25 uppercase tracking-widest">{data.user.rank}</span>
            </>
          )}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="px-4 sm:px-6 max-w-2xl mx-auto">
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-white/[0.03] border border-white/8 rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-white/40" />
              </div>
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium mb-0.5">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-semibold text-white/90 tracking-tight">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
