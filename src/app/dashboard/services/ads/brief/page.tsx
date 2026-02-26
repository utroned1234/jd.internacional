'use client'

import { useState, useEffect, useRef } from 'react'
import {
    Mic, MicOff, Type, Loader2, Sparkles, ArrowLeft, CheckCircle2,
    AlertCircle, Edit3, Save, RefreshCw, Volume2, Square, Play
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type InputMode = 'audio' | 'text'

interface BriefForm {
    name: string; industry: string; description: string; valueProposition: string
    painPoints: string[]; interests: string[]; brandVoice: string
    brandColors: string[]; visualStyle: string[]; primaryObjective: string
    mainCTA: string; targetLocations: string[]; keyMessages: string[]
    personalityTraits: string[]; contentThemes: string[]; engagementLevel: string
}

const emptyBrief: BriefForm = {
    name: '', industry: '', description: '', valueProposition: '',
    painPoints: [], interests: [], brandVoice: '', brandColors: [],
    visualStyle: [], primaryObjective: 'conversion', mainCTA: 'Comprar ahora',
    targetLocations: [], keyMessages: [], personalityTraits: [],
    contentThemes: [], engagementLevel: 'medio'
}

function TagList({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
    const [input, setInput] = useState('')
    const add = () => {
        const v = input.trim()
        if (v && !items.includes(v)) onChange([...items, v])
        setInput('')
    }
    return (
        <div>
            <div className="flex flex-wrap gap-2 mb-2">
                {items.map((item, i) => (
                    <span key={i} className="flex items-center gap-1.5 text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full font-medium">
                        {item}
                        <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-purple-400 hover:text-red-400 ml-0.5">×</button>
                    </span>
                ))}
            </div>
            <div className="flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), add())}
                    placeholder={placeholder}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20"
                />
                <button onClick={add} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-purple-500/20 transition-all">
                    + Agregar
                </button>
            </div>
        </div>
    )
}

export default function BriefPage() {
    const router = useRouter()
    const [inputMode, setInputMode] = useState<InputMode>('text')
    const [text, setText] = useState('')
    const [recording, setRecording] = useState(false)
    const [recordingTime, setRecordingTime] = useState(0)
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
    const [transcribing, setTranscribing] = useState(false)
    const [generating, setGenerating] = useState(false)
    const [saving, setSaving] = useState(false)
    const [brief, setBrief] = useState<BriefForm | null>(null)
    const [existingBriefId, setExistingBriefId] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)

    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Load existing brief
        fetch('/api/ads/brief').then(r => r.json()).then(d => {
            if (d.brief) {
                setBrief({
                    name: d.brief.name, industry: d.brief.industry,
                    description: d.brief.description, valueProposition: d.brief.valueProposition,
                    painPoints: d.brief.painPoints, interests: d.brief.interests,
                    brandVoice: d.brief.brandVoice, brandColors: d.brief.brandColors,
                    visualStyle: d.brief.visualStyle, primaryObjective: d.brief.primaryObjective,
                    mainCTA: d.brief.mainCTA, targetLocations: d.brief.targetLocations,
                    keyMessages: d.brief.keyMessages, personalityTraits: d.brief.personalityTraits,
                    contentThemes: d.brief.contentThemes, engagementLevel: d.brief.engagementLevel || 'medio'
                })
                setExistingBriefId(d.brief.id)
            }
        })
        return () => { if (timerRef.current) clearInterval(timerRef.current) }
    }, [])

    async function startRecording() {
        setError(null)
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            chunksRef.current = []
            const mr = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' })
            mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: mr.mimeType })
                setAudioBlob(blob)
                stream.getTracks().forEach(t => t.stop())
            }
            mr.start(250)
            mediaRecorderRef.current = mr
            setRecording(true)
            setRecordingTime(0)
            timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
        } catch { setError('No se pudo acceder al micrófono. Verifica los permisos del navegador.') }
    }

    function stopRecording() {
        if (mediaRecorderRef.current?.state !== 'inactive') {
            mediaRecorderRef.current?.stop()
        }
        if (timerRef.current) clearInterval(timerRef.current)
        setRecording(false)
    }

    async function transcribeAudio() {
        if (!audioBlob) return
        setTranscribing(true)
        setError(null)
        try {
            const fd = new FormData()
            fd.append('audio', audioBlob, 'recording.webm')
            const res = await fetch('/api/ads/brief/transcribe', { method: 'POST', body: fd })
            const data = await res.json()
            if (!res.ok) return setError(data.error || 'Error al transcribir')
            setText(data.text)
            setInputMode('text')
        } catch { setError('Error de conexión al transcribir') }
        finally { setTranscribing(false) }
    }

    async function generateBrief() {
        if (!text.trim() || text.trim().length < 20) return setError('Escribe al menos 20 caracteres sobre tu negocio')
        setGenerating(true)
        setError(null)
        try {
            const res = await fetch('/api/ads/brief/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: text.trim() })
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || 'Error al generar brief')
            setBrief({ ...emptyBrief, ...data.brief })
            setEditing(true)
        } catch { setError('Error de conexión') }
        finally { setGenerating(false) }
    }

    async function saveBrief() {
        if (!brief) return
        setSaving(true)
        setError(null)
        try {
            const method = existingBriefId ? 'PUT' : 'POST'
            const body = existingBriefId ? { id: existingBriefId, ...brief } : brief
            const res = await fetch('/api/ads/brief', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            })
            const data = await res.json()
            if (!res.ok) return setError(data.error || 'Error al guardar')
            setExistingBriefId(data.brief.id)
            setEditing(false)
            setSuccess('Business Brief guardado correctamente')
            setTimeout(() => router.push('/dashboard/services/ads/strategies'), 1500)
        } catch { setError('Error de conexión') }
        finally { setSaving(false) }
    }

    const fmtTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`

    return (
        <div className="px-4 md:px-6 pt-6 max-w-3xl mx-auto pb-24 text-white">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/services/ads" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all">
                    <ArrowLeft size={16} />
                </Link>
                <div>
                    <h1 className="text-xl font-black uppercase tracking-tighter">Business Brief</h1>
                    <p className="text-xs text-white/30">Tu perfil de negocio potenciado por IA</p>
                </div>
            </div>

            {error && (
                <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 text-sm">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{error}</p>
                    <button onClick={() => setError(null)} className="ml-auto font-bold text-xs">✕</button>
                </div>
            )}
            {success && (
                <div className="mb-5 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 text-green-400 text-sm">
                    <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
                    <p>{success}</p>
                </div>
            )}

            {/* If brief exists and not editing, show it */}
            {brief && !editing && !generating ? (
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-green-400" size={20} />
                            <div>
                                <h2 className="font-black text-lg">{brief.name}</h2>
                                <p className="text-xs text-white/30">{brief.industry}</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setBrief(null); setExistingBriefId(null); setText('') }}
                                className="text-xs font-bold px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={12} /> Nuevo Brief
                            </button>
                            <button
                                onClick={() => setEditing(true)}
                                className="text-xs font-bold px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-500 transition-all flex items-center gap-2"
                            >
                                <Edit3 size={12} /> Editar
                            </button>
                        </div>
                    </div>

                    <BriefPreview brief={brief} />

                    <Link
                        href="/dashboard/services/ads/strategies"
                        className="mt-8 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                    >
                        <Sparkles size={18} /> Elegir Estrategia de Pauta
                    </Link>
                </div>
            ) : (
                <>
                    {/* Input section (shown when no brief or editing) */}
                    {!brief && (
                        <>
                            {/* Mode tabs */}
                            <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/8">
                                <button
                                    onClick={() => setInputMode('audio')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'audio' ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    <Mic size={15} /> Grabar Audio
                                </button>
                                <button
                                    onClick={() => setInputMode('text')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === 'text' ? 'bg-white text-black' : 'text-white/40 hover:text-white/70'}`}
                                >
                                    <Type size={15} /> Escribir Texto
                                </button>
                            </div>

                            {/* Audio mode */}
                            {inputMode === 'audio' && (
                                <div className="text-center py-8">
                                    <p className="text-xs text-white/30 mb-8">Describe tu negocio hablando naturalmente. La IA extraerá toda la información automáticamente.</p>

                                    {!audioBlob ? (
                                        <div className="flex flex-col items-center gap-6">
                                            <button
                                                onClick={recording ? stopRecording : startRecording}
                                                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${recording
                                                    ? 'bg-red-500 hover:bg-red-400 shadow-[0_0_60px_rgba(239,68,68,0.5)]'
                                                    : 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_60px_rgba(139,92,246,0.4)]'
                                                    }`}
                                            >
                                                {recording && (
                                                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25" />
                                                )}
                                                {recording ? <Square size={32} className="text-white" /> : <Mic size={32} className="text-white" />}
                                            </button>

                                            {recording && (
                                                <div className="text-center">
                                                    <p className="text-4xl font-black font-mono text-red-400">{fmtTime(recordingTime)}</p>
                                                    <p className="text-xs text-white/30 mt-1">Grabando... Toca para detener</p>
                                                </div>
                                            )}
                                            {!recording && (
                                                <p className="text-sm text-white/40">Toca para empezar a grabar</p>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500/40 flex items-center justify-center">
                                                <Volume2 size={32} className="text-green-400" />
                                            </div>
                                            <p className="text-sm text-white/60">Audio grabado ({fmtTime(recordingTime)})</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => { setAudioBlob(null); setRecordingTime(0) }}
                                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all flex items-center gap-2"
                                                >
                                                    <RefreshCw size={14} /> Volver a grabar
                                                </button>
                                                <button
                                                    onClick={transcribeAudio}
                                                    disabled={transcribing}
                                                    className="px-6 py-2 rounded-xl bg-purple-600 text-white text-sm font-bold hover:bg-purple-500 disabled:opacity-50 transition-all flex items-center gap-2"
                                                >
                                                    {transcribing ? <><Loader2 size={14} className="animate-spin" /> Transcribiendo...</> : <><Sparkles size={14} /> Transcribir Audio</>}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Text mode */}
                            {inputMode === 'text' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">
                                            Describe tu negocio
                                        </label>
                                        <textarea
                                            value={text}
                                            onChange={e => setText(e.target.value)}
                                            rows={8}
                                            placeholder="Ejemplo: Mi negocio se llama 'My Detox' y vendemos productos naturales para pérdida de peso, desintoxicación y salud digestiva. Nuestros clientes tienen problemas de estreñimiento, caída de cabello y dificultad para bajar de peso. Nuestra propuesta de valor es ofrecer soluciones naturales y efectivas sin efectos secundarios..."
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 placeholder:text-white/15 leading-relaxed"
                                        />
                                        <p className="text-xs text-white/20 mt-1.5 text-right">{text.length} caracteres · mínimo 20</p>
                                    </div>

                                    <button
                                        onClick={generateBrief}
                                        disabled={generating || text.trim().length < 20}
                                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-4 rounded-2xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                                    >
                                        {generating
                                            ? <><Loader2 size={18} className="animate-spin" /> Analizando tu negocio con IA...</>
                                            : <><Sparkles size={18} /> Generar Business Brief con IA</>
                                        }
                                    </button>
                                </div>
                            )}
                        </>
                    )}

                    {/* Edit form */}
                    {brief && editing && (
                        <EditBriefForm
                            brief={brief}
                            onChange={setBrief}
                            onSave={saveBrief}
                            onCancel={() => setEditing(false)}
                            saving={saving}
                        />
                    )}
                </>
            )}
        </div>
    )
}

function BriefPreview({ brief }: { brief: BriefForm }) {
    return (
        <div className="space-y-4">
            {/* Business Info */}
            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Información del Negocio</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Nombre" value={brief.name} />
                    <Field label="Industria" value={brief.industry} />
                    <div className="md:col-span-2"><Field label="Descripción" value={brief.description} /></div>
                    <div className="md:col-span-2"><Field label="Propuesta de Valor" value={brief.valueProposition} /></div>
                </div>
            </div>

            {/* Audience */}
            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Audiencia Objetivo</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Puntos de Dolor</p>
                        <div className="flex flex-wrap gap-1.5">{brief.painPoints.map((p, i) => <Tag key={i} text={p} color="red" />)}</div>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Intereses</p>
                        <div className="flex flex-wrap gap-1.5">{brief.interests.map((p, i) => <Tag key={i} text={p} color="blue" />)}</div>
                    </div>
                </div>
            </div>

            {/* Brand Identity */}
            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Identidad de Marca</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Voz de Marca" value={brief.brandVoice} />
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Colores</p>
                        <div className="flex gap-2">{brief.brandColors.map((c, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <span className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
                                <span className="text-xs font-mono text-white/50">{c}</span>
                            </div>
                        ))}</div>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Estilo Visual</p>
                        <div className="flex flex-wrap gap-1.5">{brief.visualStyle.map((s, i) => <Tag key={i} text={s} color="purple" />)}</div>
                    </div>
                    <div>
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Rasgos de Personalidad</p>
                        <div className="flex flex-wrap gap-1.5">{brief.personalityTraits.map((s, i) => <Tag key={i} text={s} color="purple" />)}</div>
                    </div>
                </div>
            </div>

            {/* Strategy */}
            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-4">Estrategia de Marketing</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Field label="Objetivo Principal" value={brief.primaryObjective} />
                    <Field label="CTA Principal" value={brief.mainCTA} />
                    <Field label="Engagement" value={brief.engagementLevel} />
                    <Field label="Ubicaciones" value={brief.targetLocations.join(', ') || 'No definido'} />
                </div>
                {brief.keyMessages.length > 0 && (
                    <div className="mt-4">
                        <p className="text-[10px] text-white/40 font-bold uppercase mb-2">Mensajes Clave</p>
                        <ul className="space-y-1">{brief.keyMessages.map((m, i) => (
                            <li key={i} className="text-xs text-white/60 flex items-start gap-2"><span className="text-purple-400 mt-0.5">•</span>{m}</li>
                        ))}</ul>
                    </div>
                )}
            </div>
        </div>
    )
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[10px] text-white/40 font-bold uppercase mb-1">{label}</p>
            <p className="text-sm text-white/80">{value || '—'}</p>
        </div>
    )
}

function Tag({ text, color }: { text: string; color: 'red' | 'blue' | 'purple' | 'green' }) {
    const colors = {
        red: 'bg-red-500/10 border-red-500/20 text-red-300',
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300',
        purple: 'bg-purple-500/10 border-purple-500/20 text-purple-300',
        green: 'bg-green-500/10 border-green-500/20 text-green-300'
    }
    return <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${colors[color]}`}>{text}</span>
}

function EditBriefForm({ brief, onChange, onSave, onCancel, saving }: {
    brief: BriefForm; onChange: (b: BriefForm) => void
    onSave: () => void; onCancel: () => void; saving: boolean
}) {
    const field = (key: keyof BriefForm) => ({
        value: brief[key] as string,
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
            onChange({ ...brief, [key]: e.target.value })
    })

    return (
        <div className="space-y-6">
            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Información del Negocio</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Nombre" {...field('name')} />
                    <InputField label="Industria" {...field('industry')} />
                    <div className="md:col-span-2"><TextareaField label="Descripción" {...field('description')} /></div>
                    <div className="md:col-span-2"><TextareaField label="Propuesta de Valor" {...field('valueProposition')} /></div>
                </div>
            </div>

            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Audiencia</p>
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Puntos de Dolor</label>
                    <TagList items={brief.painPoints} onChange={v => onChange({ ...brief, painPoints: v })} placeholder="Ej: Dificultad para bajar de peso..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Intereses</label>
                    <TagList items={brief.interests} onChange={v => onChange({ ...brief, interests: v })} placeholder="Ej: Salud y bienestar..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Ubicaciones</label>
                    <TagList items={brief.targetLocations} onChange={v => onChange({ ...brief, targetLocations: v })} placeholder="Ej: Colombia, México..." />
                </div>
            </div>

            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Identidad de Marca</p>
                <InputField label="Voz de Marca" {...field('brandVoice')} />
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Estilo Visual</label>
                    <TagList items={brief.visualStyle} onChange={v => onChange({ ...brief, visualStyle: v })} placeholder="Ej: minimalista, moderno..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Rasgos de Personalidad</label>
                    <TagList items={brief.personalityTraits} onChange={v => onChange({ ...brief, personalityTraits: v })} placeholder="Ej: Confiable, Cercano..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Mensajes Clave</label>
                    <TagList items={brief.keyMessages} onChange={v => onChange({ ...brief, keyMessages: v })} placeholder="Ej: Recupera tu bienestar..." />
                </div>
            </div>

            <div className="bg-dark-900/40 border border-white/8 rounded-2xl p-5 space-y-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Estrategia</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">Objetivo Principal</label>
                        <select {...field('primaryObjective')} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50">
                            <option value="conversion">Conversión / Ventas</option>
                            <option value="leads">Generación de Leads</option>
                            <option value="traffic">Tráfico al sitio</option>
                            <option value="awareness">Conciencia de marca</option>
                        </select>
                    </div>
                    <InputField label="CTA Principal" {...field('mainCTA')} placeholder="Ej: Comprar ahora" />
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={onCancel} className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-bold hover:bg-white/10 transition-all">
                    Cancelar
                </button>
                <button onClick={onSave} disabled={saving} className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                    {saving ? <><Loader2 size={16} className="animate-spin" /> Guardando...</> : <><Save size={16} /> Guardar Brief</>}
                </button>
            </div>
        </div>
    )
}

function InputField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: any; placeholder?: string }) {
    return (
        <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">{label}</label>
            <input value={value} onChange={onChange} placeholder={placeholder}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500/50 placeholder:text-white/20" />
        </div>
    )
}

function TextareaField({ label, value, onChange }: { label: string; value: string; onChange: any }) {
    return (
        <div>
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest block mb-2">{label}</label>
            <textarea value={value} onChange={onChange} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white resize-none focus:outline-none focus:border-purple-500/50 leading-relaxed" />
        </div>
    )
}
