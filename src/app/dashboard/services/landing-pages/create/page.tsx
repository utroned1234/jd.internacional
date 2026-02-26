'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Layout, ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react'
import Link from 'next/link'

const templates = [
    {
        id: 'ndt-elite',
        name: 'Método NDT (Oficial)',
        description: 'Design de ultra-conversão com fundo hexagonal e neons cian. O padrão ouro para negócios digitais.',
        preview: 'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=400',
        color: '#00F0FF'
    }
]

export default function CreateLandingPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        templateId: 'ndt-elite'
    })
    const [error, setError] = useState('')

    const handleCreate = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/landing-pages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (res.ok) {
                router.push(`/dashboard/services/landing-pages/${data.page.id}/edit`)
            } else {
                setError(data.error || 'Error al crear la página')
            }
        } catch (err) {
            setError('Error de conexión')
        } finally {
            setLoading(false)
        }
    }

    const generateSlug = (name: string) => {
        return name.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '')
    }

    return (
        <div className="px-4 sm:px-6 pt-6 max-w-5xl mx-auto pb-20 font-inter text-white">
            <Link href="/dashboard/services/landing-pages" className="flex items-center gap-2 text-dark-400 hover:text-white mb-8 transition-colors group w-fit">
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Volver a mis páginas
            </Link>

            <div className="flex items-center gap-4 mb-10">
                <div className="w-12 h-12 rounded-2xl bg-[#9B00FF]/10 flex items-center justify-center border border-[#9B00FF]/20 shadow-[0_0_20px_rgba(155,0,255,0.2)]">
                    <PlusCircle className="w-6 h-6 text-[#9B00FF]" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Crear Nueva Landing</h1>
                    <p className="text-dark-400 text-sm mt-1">Configura tu embudo en solo 2 pasos</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-4 rounded-xl mb-8 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    {error}
                </div>
            )}

            {/* Steps Indicator */}
            <div className="flex items-center gap-4 mb-12">
                <div className={`flex items-center gap-2 ${step >= 1 ? 'text-[#9B00FF]' : 'text-dark-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 1 ? 'border-[#9B00FF] bg-[#9B00FF]/10' : 'border-dark-700'}`}>
                        {step > 1 ? <Check size={16} /> : '1'}
                    </div>
                    <span className="text-sm font-bold">Concepto</span>
                </div>
                <div className="h-px w-10 bg-dark-800" />
                <div className={`flex items-center gap-2 ${step >= 2 ? 'text-[#9B00FF]' : 'text-dark-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${step >= 2 ? 'border-[#9B00FF] bg-[#9B00FF]/10' : 'border-dark-700'}`}>
                        2
                    </div>
                    <span className="text-sm font-bold">Design Definitivo</span>
                </div>
            </div>

            {step === 1 ? (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-dark-300 ml-1 uppercase tracking-widest">Nombre de la Campaña</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    setFormData({ ...formData, name: e.target.value, slug: generateSlug(e.target.value) })
                                }}
                                className="w-full bg-dark-900 border border-white/5 rounded-2xl p-4 focus:border-[#9B00FF]/50 transition-all outline-none text-lg"
                                placeholder="Ej: Lanzamiento Enero 2024"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-dark-300 ml-1 uppercase tracking-widest">URL de la Página</label>
                            <div className="flex items-center gap-2 bg-dark-900 border border-white/5 rounded-2xl p-4">
                                <span className="text-dark-500">/lp/</span>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                                    className="bg-transparent border-none outline-none flex-1 text-lg"
                                    placeholder="mi-oferta-especial"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        disabled={!formData.name || !formData.slug}
                        onClick={() => setStep(2)}
                        className="w-full md:w-fit bg-white text-dark-950 px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#9B00FF] hover:text-white transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Siguiente Paso <ArrowRight size={20} />
                    </button>
                </div>
            ) : (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {templates.map((template) => (
                            <div
                                key={template.id}
                                onClick={() => setFormData({ ...formData, templateId: template.id })}
                                className={`group relative bg-dark-900 border-2 rounded-3xl overflow-hidden cursor-pointer transition-all ${formData.templateId === template.id ? 'border-[#9B00FF] ring-4 ring-[#9B00FF]/10' : 'border-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="aspect-video overflow-hidden">
                                    <img src={template.preview} alt={template.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    {formData.templateId === template.id && (
                                        <div className="absolute inset-0 bg-[#9B00FF]/20 flex items-center justify-center">
                                            <div className="bg-white text-[#9B00FF] w-12 h-12 rounded-full flex items-center justify-center shadow-2xl">
                                                <Check size={28} strokeWidth={3} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold mb-1">{template.name}</h3>
                                    <p className="text-dark-400 text-sm leading-relaxed">{template.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setStep(1)}
                            className="bg-dark-800 text-white px-8 py-4 rounded-2xl font-bold hover:bg-dark-700 transition-all"
                        >
                            Anterior
                        </button>
                        <button
                            disabled={loading}
                            onClick={handleCreate}
                            className="flex-1 bg-[#9B00FF] text-white px-10 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-[#9B00FF]/90 transition-all shadow-[0_4px_20px_rgba(155,0,255,0.3)] disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Finalizar y Abrir Editor'}
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function PlusCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><path d="M8 12h8" /><path d="M12 8v8" />
        </svg>
    )
}
