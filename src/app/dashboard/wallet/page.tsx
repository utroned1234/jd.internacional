'use client'

import { useEffect, useState, useRef } from 'react'
import {
  Wallet,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  TrendingUp,
  Send,
  ExternalLink,
} from 'lucide-react'

interface Balance {
  totalEarned: number
  available: number
}

interface WithdrawalRow {
  id: string
  amount: number
  walletQrUrl: string | null
  walletAddress: string | null
  proofUrl: string | null
  status: string
  notes: string | null
  createdAt: string
  paidAt: string | null
}

const STATUS_BADGE: Record<string, { label: string; color: string; icon: React.FC<{ size?: number; className?: string }> }> = {
  PENDING: { label: 'Pendiente', color: 'text-orange-400 bg-orange-500/10 border-orange-500/25', icon: Clock },
  APPROVED: { label: 'Aprobado', color: 'text-blue-400 bg-blue-500/10 border-blue-500/25', icon: CheckCircle },
  PAID: { label: 'Pagado', color: 'text-green-400 bg-green-500/10 border-green-500/25', icon: CheckCircle },
  REJECTED: { label: 'Rechazado', color: 'text-red-400 bg-red-500/10 border-red-500/25', icon: XCircle },
}

export default function WalletPage() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [walletAddress, setWalletAddress] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const qrInputRef = useRef<HTMLInputElement>(null)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/withdrawals')
    const data = await res.json()
    setBalance(data.balance ?? null)
    setWithdrawals(data.withdrawals ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function uploadQr(file: File) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      setQrUrl(data.url)
    } else {
      setError('Error al subir el QR')
    }
  }

  async function submit() {
    setError('')
    setSuccess('')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Ingresa un monto válido')
      return
    }
    if (!walletAddress && !qrUrl) {
      setError('Ingresa tu dirección de wallet o sube tu QR')
      return
    }
    setSubmitting(true)
    const res = await fetch('/api/withdrawals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: Number(amount), walletAddress, walletQrUrl: qrUrl }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (res.ok) {
      setSuccess('¡Solicitud de retiro enviada! El equipo la procesará pronto.')
      setAmount('')
      setWalletAddress('')
      setQrUrl('')
      load()
    } else {
      setError(data.error ?? 'Error al enviar solicitud')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-purple-400" size={28} />
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 pt-6 max-w-2xl mx-auto pb-24 text-white space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <Wallet size={18} className="text-white/60" />
        </div>
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter">Mi Billetera</h1>
          <p className="text-[11px] text-white/30">Gestiona tus ganancias y solicita retiros</p>
        </div>
      </div>

      {/* Balance cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-yellow-500/8 border-yellow-500/20 p-4">
          <TrendingUp size={15} className="text-yellow-400 mb-2" />
          <p className="text-2xl font-black text-yellow-400">${(balance?.totalEarned ?? 0).toFixed(2)}</p>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Total ganado</p>
        </div>
        <div className="rounded-2xl border bg-green-500/8 border-green-500/20 p-4">
          <DollarSign size={15} className="text-green-400 mb-2" />
          <p className="text-2xl font-black text-green-400">${(balance?.available ?? 0).toFixed(2)}</p>
          <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-0.5">Disponible</p>
        </div>
      </div>

      {/* Withdrawal form */}
      <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Solicitar retiro</p>

        {/* Amount */}
        <div>
          <label className="text-[11px] text-white/40 font-bold mb-1.5 block">Monto a retirar (USD)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 font-bold">$</span>
            <input
              type="number"
              min="1"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-7 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-purple-500/50"
            />
          </div>
          {balance && (
            <button
              onClick={() => setAmount(balance.available.toFixed(2))}
              className="text-[10px] text-purple-400 hover:text-purple-300 mt-1"
            >
              Usar saldo disponible: ${balance.available.toFixed(2)}
            </button>
          )}
        </div>

        {/* Wallet address */}
        <div>
          <label className="text-[11px] text-white/40 font-bold mb-1.5 block">Dirección de wallet (USDT TRC20 / BEP20)</label>
          <input
            type="text"
            placeholder="TXxx... o 0x..."
            value={walletAddress}
            onChange={e => setWalletAddress(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm font-mono text-white/70 placeholder-white/20 outline-none focus:border-purple-500/50"
          />
        </div>

        {/* QR Upload */}
        <div>
          <label className="text-[11px] text-white/40 font-bold mb-1.5 block">O sube tu QR de billetera (opcional)</label>
          <input
            ref={qrInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => {
              const file = e.target.files?.[0]
              if (file) uploadQr(file)
            }}
          />
          {qrUrl ? (
            <div className="flex items-center gap-3 bg-white/5 border border-green-500/20 rounded-xl px-3 py-2.5">
              <CheckCircle size={14} className="text-green-400 shrink-0" />
              <span className="text-xs text-green-400 flex-1">QR subido correctamente</span>
              <a href={qrUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-white/30 hover:text-white/60">
                <ExternalLink size={11} />
              </a>
              <button
                onClick={() => setQrUrl('')}
                className="text-[10px] text-white/30 hover:text-red-400"
              >
                Quitar
              </button>
            </div>
          ) : (
            <button
              onClick={() => qrInputRef.current?.click()}
              disabled={uploading}
              className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-white/10 rounded-xl text-xs text-white/30 hover:border-purple-500/30 hover:text-purple-400 transition-colors"
            >
              {uploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploading ? 'Subiendo...' : 'Subir imagen QR de billetera'}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">{error}</p>
        )}
        {success && (
          <p className="text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">{success}</p>
        )}

        <button
          onClick={submit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {submitting ? 'Enviando...' : 'Solicitar retiro'}
        </button>
      </div>

      {/* History */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Historial de retiros</p>

        {withdrawals.length === 0 ? (
          <div className="text-center py-10 bg-white/[0.015] border border-dashed border-white/8 rounded-3xl">
            <Wallet size={24} className="text-white/15 mx-auto mb-2" />
            <p className="text-xs text-white/20">Aún no tienes solicitudes de retiro</p>
          </div>
        ) : (
          <div className="bg-white/[0.025] border border-white/8 rounded-2xl divide-y divide-white/5 overflow-hidden">
            {withdrawals.map(w => {
              const s = STATUS_BADGE[w.status] ?? STATUS_BADGE.PENDING
              const Icon = s.icon
              return (
                <div key={w.id} className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                      <Icon size={13} className={s.color.split(' ')[0]} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${s.color}`}>
                          {s.label}
                        </span>
                        <span className="text-[10px] text-white/25">
                          {new Date(w.createdAt).toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      {w.walletAddress && (
                        <p className="text-[10px] font-mono text-white/30 truncate">{w.walletAddress}</p>
                      )}
                      {w.notes && <p className="text-[10px] text-white/25 italic">{w.notes}</p>}
                      {w.proofUrl && (
                        <a href={w.proofUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1 mt-0.5">
                          <ExternalLink size={9} /> Ver comprobante
                        </a>
                      )}
                    </div>
                    <span className="text-base font-black text-yellow-400 shrink-0">
                      ${w.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
