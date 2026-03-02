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

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Slider de banner
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => (prev + 1) % backgroundImages.length)
    }, 4000)
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
        <div className="w-12 h-12 border-4 border-[#00F5FF]/30 border-t-[#00F5FF] rounded-full animate-spin" style={{ boxShadow: '0 0 20px #00F5FF55' }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white/40">
        Error al cargar datos
      </div>
    )
  }

  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${data.user.referralCode}`

  return (
    <div className="px-4 sm:px-6 pt-2 pb-20 max-w-7xl mx-auto space-y-6">

      {/* ── PORTADA + AVATAR ── */}
      <div className="relative">
        <div className="relative h-44 sm:h-60 w-full overflow-hidden rounded-3xl bg-[#050314]">
          <img
            src={backgroundImages[currentImageIndex]}
            alt="Background"
            className="w-full h-full object-cover brightness-[0.6] contrast-[1.1] transition-opacity duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050314] via-[#050314]/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, #9B00FF, transparent)' }} />

          <Link href="/dashboard/settings" className="absolute top-4 left-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-[#00F5FF] hover:border-[#00F5FF]/40 transition-all group/conf backdrop-blur-sm">
            <Settings className="w-4 h-4 group-hover/conf:rotate-90 transition-transform duration-500" />
          </Link>
          <button onClick={handleLogout} className="absolute top-4 right-4 z-30 w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-red-400 hover:border-red-500/40 transition-all group/out backdrop-blur-sm">
            <LogOut className="w-4 h-4 group-hover/out:-translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Avatar flotante */}
        <div className="absolute left-1/2 z-20" style={{ top: '100%', transform: 'translate(-50%, -50%)' }}>
          <div className="relative group/avatar">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} />
            <div className="absolute -inset-[3px] rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, #00F5FF, #FF2DF7, #9B00FF, #00FF88, #00F5FF)', animationDuration: '4s' }} />
            <div className="absolute -inset-[3px] rounded-full blur-sm opacity-60" style={{ background: 'conic-gradient(from 0deg, #00F5FF, #FF2DF7, #9B00FF, #00FF88, #00F5FF)', animationDuration: '4s' }} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="relative w-24 h-24 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-[#050314] border-2 border-[#050314] shadow-2xl block"
            >
              {data.user.avatarUrl ? (
                <img src={data.user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserCircle className="w-full h-full text-white/10 group-hover/avatar:text-white/30 transition-colors" />
              )}
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${uploading ? 'opacity-100' : 'opacity-0 group-hover/avatar:opacity-100'}`}>
                {uploading
                  ? <div className="w-6 h-6 border-2 border-[#00F5FF]/40 border-t-[#00F5FF] rounded-full animate-spin" />
                  : <><Camera className="w-5 h-5 sm:w-6 sm:h-6 text-[#00F5FF]" /><span className="text-[8px] font-black uppercase tracking-widest text-[#00F5FF]/80">Cambiar</span></>
                }
              </div>
            </button>
            <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#050314] z-10 ${data.user.isActive ? 'bg-[#00FF88]' : 'bg-red-500'}`}
              style={data.user.isActive ? { boxShadow: '0 0 10px #00FF88' } : {}} />
          </div>
          {avatarError && (
            <p className="absolute top-full left-1/2 -translate-x-1/2 mt-3 text-[10px] text-red-400 font-bold whitespace-nowrap bg-[#0F0A2E] px-3 py-1 rounded-full border border-red-500/30">
              {avatarError}
            </p>
          )}
        </div>
      </div>

      {/* ── NOMBRE ── */}
      <div className="flex flex-col items-center text-center pt-10 sm:pt-14 gap-1">
        <h1 className="text-lg sm:text-2xl font-medium text-white uppercase tracking-widest leading-none">
          {data.user.fullName}
        </h1>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs sm:text-sm font-light tracking-[0.3em] uppercase" style={{ color: '#00F5FF' }}>
            @{data.user.username}
          </span>
          {data.user.rank && (
            <>
              <span className="w-px h-3 bg-white/10" />
              <span className="text-[10px] font-light text-white/30 uppercase tracking-widest">{data.user.rank}</span>
            </>
          )}
        </div>
        <div className="mt-3 h-px w-24 rounded-full" style={{ background: 'linear-gradient(90deg, transparent, #00F5FF, #FF2DF7, transparent)' }} />
      </div>

      {/* ── STATS CARDS ── */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        {[
          { icon: Users,      label: 'Mi Red',      val: data.stats.totalNetwork,                             from: '#00F5FF', to: '#0066FF' },
          { icon: TrendingUp, label: 'Directos',    val: data.stats.directReferrals,                          from: '#FF2DF7', to: '#9B00FF' },
          { icon: DollarSign, label: 'Comisiones',  val: `$${data.stats.totalCommissions.toFixed(2)}`,        from: '#FFB800', to: '#FF5C00' },
          { icon: CreditCard, label: 'Disponible',  val: `$${data.stats.pendingBalance.toFixed(2)}`,          from: '#00FF88', to: '#00C2FF' },
        ].map((stat, i) => (
          <div key={i} className="relative rounded-2xl sm:rounded-3xl p-3 sm:p-5 overflow-hidden border transition-all duration-300 hover:scale-[1.03] cursor-default"
            style={{ background: `linear-gradient(135deg, ${stat.from}12, ${stat.to}08)`, borderColor: `${stat.from}25`, boxShadow: `0 0 20px ${stat.from}18` }}>
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${stat.from}, ${stat.to}, transparent)` }} />
            <div className="absolute -top-4 -right-4 w-14 h-14 rounded-full blur-2xl opacity-30" style={{ background: stat.from }} />
            <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3"
              style={{ background: `${stat.from}18`, border: `1px solid ${stat.from}30` }}>
              <stat.icon className="w-3 h-3 sm:w-4 sm:h-4" style={{ color: stat.from }} />
            </div>
            <p className="text-white/30 text-[7px] sm:text-[8px] font-black uppercase tracking-widest mb-0.5 leading-tight">{stat.label}</p>
            <p className="text-sm sm:text-xl font-black tracking-tighter" style={{ color: stat.from }}>{stat.val}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
