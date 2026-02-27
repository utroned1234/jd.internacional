'use client'

import { useEffect, useState, useRef } from 'react'
import { Settings, Save, Loader2, Check, QrCode, Upload, ExternalLink, Trash2 } from 'lucide-react'

const PACK_KEYS = [
  { key: 'PRICE_BASIC', label: 'Pack Básico', desc: 'Precio base para el pack de entrada', color: 'text-cyan-400 border-cyan-500/25 bg-cyan-500/5' },
  { key: 'PRICE_PRO', label: 'Pack Pro', desc: 'Precio para el pack profesional', color: 'text-purple-400 border-purple-500/25 bg-purple-500/5' },
  { key: 'PRICE_ELITE', label: 'Pack Elite', desc: 'Precio para el pack premium (próximamente)', color: 'text-yellow-400 border-yellow-500/25 bg-yellow-500/5' },
]

export default function AdminSettingsPage() {
  const [prices, setPrices] = useState<Record<string, string>>({})
  const [paymentQr, setPaymentQr] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [uploadingQr, setUploadingQr] = useState(false)
  const qrInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then(r => r.json())
      .then(d => {
        const map: Record<string, string> = {}
        d.settings?.forEach((s: { key: string; value: string }) => { map[s.key] = s.value })
        setPrices(map)
        setPaymentQr(map['PAYMENT_QR_URL'] ?? '')
        setLoading(false)
      })
  }, [])

  async function savePrice(key: string) {
    setSaving(key)
    const value = prices[key]
    if (!value || isNaN(Number(value)) || Number(value) <= 0) {
      alert('Precio inválido')
      setSaving(null)
      return
    }
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setSaving(null)
    if (res.ok) {
      setSaved(key)
      setTimeout(() => setSaved(null), 2000)
    }
  }

  async function uploadQr(file: File) {
    setUploadingQr(true)
    const fd = new FormData()
    fd.append('file', file)
    const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
    const uploadData = await uploadRes.json()
    setUploadingQr(false)

    if (!uploadRes.ok || !uploadData.url) {
      alert(uploadData.error ?? 'Error al subir la imagen a Supabase Storage. Verifica que el bucket "uploads" exista y sea público.')
      return
    }

    setPaymentQr(uploadData.url)
    const saveRes = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'PAYMENT_QR_URL', value: uploadData.url }),
    })

    if (!saveRes.ok) {
      alert('La imagen se subió pero no se pudo guardar en la configuración. Inténtalo de nuevo.')
      return
    }

    setSaved('PAYMENT_QR_URL')
    setTimeout(() => setSaved(null), 2000)
  }

  async function removeQr() {
    setPaymentQr('')
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'PAYMENT_QR_URL', value: '' }),
    })
  }

  return (
    <div className="space-y-6 max-w-xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
          <Settings size={18} className="text-white/50" /> Configuración
        </h1>
        <p className="text-xs text-white/30 mt-0.5">Gestiona precios y métodos de pago.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="animate-spin text-purple-400" size={22} />
        </div>
      ) : (
        <>
          {/* Payment QR */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-2">
              <QrCode size={11} /> QR de Pago Global
            </p>
            <div className="bg-white/[0.025] border border-white/8 rounded-2xl p-5">
              <p className="text-xs text-white/50 mb-4">
                Este QR se muestra a los usuarios en la página de checkout para que realicen el pago. Sube el QR de tu billetera USDT u otro método de pago.
              </p>

              {paymentQr ? (
                <div className="flex items-start gap-4">
                  {/* Preview */}
                  <div className="w-28 h-28 rounded-xl border border-white/10 overflow-hidden bg-white flex items-center justify-center shrink-0">
                    <img src={paymentQr} alt="QR de pago" className="w-full h-full object-contain" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-1.5">
                      {saved === 'PAYMENT_QR_URL' && (
                        <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <Check size={10} /> Guardado
                        </span>
                      )}
                    </div>
                    <a
                      href={paymentQr}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      <ExternalLink size={11} /> Ver QR completo
                    </a>
                    <div className="flex gap-2">
                      <button
                        onClick={() => qrInputRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-600/30 transition-colors"
                      >
                        <Upload size={11} /> Cambiar QR
                      </button>
                      <button
                        onClick={removeQr}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600/15 border border-red-500/25 text-red-400 text-xs font-bold hover:bg-red-600/25 transition-colors"
                      >
                        <Trash2 size={11} /> Quitar
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => qrInputRef.current?.click()}
                  disabled={uploadingQr}
                  className="w-full flex flex-col items-center justify-center gap-2 py-8 border-2 border-dashed border-white/10 rounded-xl text-white/30 hover:border-purple-500/40 hover:text-purple-400 transition-colors"
                >
                  {uploadingQr ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <QrCode size={24} className="text-white/20" />
                      <span className="text-xs font-bold">Subir imagen del QR de pago</span>
                      <span className="text-[10px] text-white/20">PNG, JPG · USDT, Binance Pay, etc.</span>
                    </>
                  )}
                </button>
              )}

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
            </div>
          </div>

          {/* Pack prices */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Precios de Packs</p>
            {PACK_KEYS.map(({ key, label, desc, color }) => (
              <div key={key} className={`rounded-2xl border p-4 ${color}`}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-black">{label}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{desc}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm font-bold">$</span>
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={prices[key] ?? ''}
                        onChange={e => setPrices(prev => ({ ...prev, [key]: e.target.value }))}
                        className="w-24 bg-black/30 border border-white/15 rounded-xl pl-6 pr-3 py-2 text-sm font-bold text-white outline-none focus:border-white/30 text-right"
                      />
                    </div>
                    <button
                      onClick={() => savePrice(key)}
                      disabled={saving === key}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold transition-colors disabled:opacity-50"
                    >
                      {saving === key ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : saved === key ? (
                        <><Check size={12} className="text-green-400" /> Guardado</>
                      ) : (
                        <><Save size={12} /> Guardar</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info */}
          <div className="bg-white/[0.02] border border-white/6 rounded-2xl p-4">
            <p className="text-[11px] text-white/30 leading-relaxed">
              <strong className="text-white/50">Flujo de compra:</strong> El usuario selecciona un pack → ve el QR de pago y los detalles → realiza el pago → sube su comprobante → tú revisas el comprobante y apruebas manualmente desde la sección <em>Compras</em>.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
