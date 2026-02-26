/**
 * OpenAI integration for the Ads AI System.
 * Uses native fetch (no SDK) with the user's own API key.
 */

export interface BusinessBriefData {
    name: string
    industry: string
    description: string
    valueProposition: string
    painPoints: string[]
    interests: string[]
    brandVoice: string
    brandColors: string[]
    visualStyle: string[]
    primaryObjective: string
    mainCTA: string
    targetLocations: string[]
    keyMessages: string[]
    personalityTraits: string[]
    contentThemes: string[]
    engagementLevel: string
}

export interface AdCopyData {
    slotIndex: number
    primaryText: string
    headline: string
    description: string
    hook: string
}

const OPENAI_BASE = 'https://api.openai.com/v1'

/** Validates a user's OpenAI API key with a lightweight model call */
export async function validateApiKey(apiKey: string): Promise<boolean> {
    try {
        const res = await fetch(`${OPENAI_BASE}/models`, {
            headers: { Authorization: `Bearer ${apiKey}` }
        })
        return res.ok
    } catch {
        return false
    }
}

/** Transcribes audio using OpenAI Whisper-1 */
export async function transcribeAudio(
    audioBuffer: Buffer,
    fileName: string,
    apiKey: string
): Promise<string> {
    const formData = new FormData()
    const blob = new Blob([audioBuffer.buffer as ArrayBuffer], { type: 'audio/webm' })
    formData.append('file', blob, fileName)
    formData.append('model', 'whisper-1')
    formData.append('language', 'es')

    const res = await fetch(`${OPENAI_BASE}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: formData
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `Whisper error ${res.status}`)
    }

    const data = await res.json()
    return data.text as string
}

/** Generates a structured BusinessBrief from free text using GPT-4o */
export async function generateBusinessBrief(
    text: string,
    apiKey: string,
    model = 'gpt-4o'
): Promise<BusinessBriefData> {
    const systemPrompt = `Eres un experto en marketing digital, copywriting y estrategia de marca. Tu tarea es analizar la descripción de un negocio y extraer información estructurada para crear campañas publicitarias de alto rendimiento. Responde ÚNICAMENTE con un JSON válido, sin markdown, sin texto adicional.`

    const userPrompt = `Analiza el siguiente texto sobre un negocio y extrae la información de marketing. Si no se menciona algún campo, inferlo inteligentemente del contexto.

TEXTO DEL NEGOCIO:
"""
${text}
"""

Devuelve EXACTAMENTE este JSON (todos los campos son obligatorios):
{
  "name": "nombre del negocio",
  "industry": "industria (ej: Salud y Bienestar, Moda, Tecnología, Alimentación, Belleza, etc)",
  "description": "descripción completa del negocio en 2-3 oraciones claras",
  "valueProposition": "propuesta de valor única que diferencia al negocio en 1-2 oraciones directas",
  "painPoints": ["problema que resuelve 1", "problema que resuelve 2", "problema que resuelve 3", "problema 4", "problema 5"],
  "interests": ["interés del cliente ideal 1", "interés 2", "interés 3", "interés 4", "interés 5"],
  "brandVoice": "tono de comunicación (ej: casual e informativo, profesional y confiable, urgente y directo)",
  "brandColors": ["#hexcolor1", "#hexcolor2", "#hexcolor3"],
  "visualStyle": ["estilo visual 1 (ej: minimalista)", "estilo 2", "estilo 3"],
  "primaryObjective": "conversion",
  "mainCTA": "llamada a la acción principal (ej: Comprar ahora, Solicitar info, Ver oferta)",
  "targetLocations": ["país o ciudad principal"],
  "keyMessages": ["mensaje clave 1", "mensaje clave 2", "mensaje clave 3"],
  "personalityTraits": ["rasgo de marca 1", "rasgo 2", "rasgo 3"],
  "contentThemes": ["tema de contenido 1", "tema 2", "tema 3"],
  "engagementLevel": "alto"
}`

    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.4,
            max_tokens: 1200,
            response_format: { type: 'json_object' }
        })
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenAI no devolvió contenido')

    try {
        return JSON.parse(content) as BusinessBriefData
    } catch {
        throw new Error('Error al parsear el brief generado por IA')
    }
}

/** Generates N ad copies based on brief + strategy using GPT-4o */
export async function generateAdCopies(params: {
    brief: BusinessBriefData
    strategyName: string
    platform: string
    objective: string
    destination: string
    mediaType: string
    count: number
    apiKey: string
    model?: string
}): Promise<AdCopyData[]> {
    const { brief, strategyName, platform, objective, destination, mediaType, count, apiKey, model = 'gpt-4o' } = params

    const platformLimits: Record<string, { primaryText: number; headline: number; description: number }> = {
        META: { primaryText: 500, headline: 40, description: 30 },
        TIKTOK: { primaryText: 300, headline: 50, description: 80 },
        GOOGLE_ADS: { primaryText: 90, headline: 30, description: 90 }
    }

    const limits = platformLimits[platform] || platformLimits['META']

    const destinationMap: Record<string, string> = {
        instagram: 'Instagram (feed y stories)',
        whatsapp: 'WhatsApp Business',
        website: 'Sitio web / tienda online',
        messenger: 'Facebook Messenger',
        tiktok: 'TikTok'
    }

    const systemPrompt = `Eres el mejor copywriter de publicidad digital de habla hispana. Creas copies de alto rendimiento que generan ventas reales. Tu escritura es directa, emocional y persuasiva. Respondes ÚNICAMENTE con JSON válido.`

    const userPrompt = `Crea exactamente ${count} variaciones de anuncios para ${platform} con la siguiente información:

NEGOCIO:
- Nombre: ${brief.name}
- Industria: ${brief.industry}
- Descripción: ${brief.description}
- Propuesta de valor: ${brief.valueProposition}
- Puntos de dolor: ${brief.painPoints.join(', ')}
- Voz de marca: ${brief.brandVoice}
- Mensajes clave: ${brief.keyMessages.join(' | ')}
- CTA principal: ${brief.mainCTA}

ESTRATEGIA: ${strategyName}
- Plataforma: ${platform}
- Objetivo: ${objective}
- Destino del tráfico: ${destinationMap[destination] || destination}
- Tipo de media: ${mediaType}

LÍMITES DE CARACTERES:
- Primary Text: máximo ${limits.primaryText} caracteres
- Headline: máximo ${limits.headline} caracteres
- Description: máximo ${limits.description} caracteres

INSTRUCCIONES:
1. Cada variación DEBE empezar con un hook diferente y poderoso
2. Usa diferentes ángulos: urgencia, curiosidad, beneficio directo, prueba social, miedo a perder
3. Incluye los puntos de dolor para generar empatía
4. Incluye la propuesta de valor
5. Termina siempre con el CTA: "${brief.mainCTA}"
6. NO superes los límites de caracteres
7. Varía el tono según la voz de marca: ${brief.brandVoice}

Devuelve EXACTAMENTE este JSON (envuelto en un objeto con clave "copies"):
{
  "copies": [
    {
      "slotIndex": 0,
      "primaryText": "copy completo aquí...",
      "headline": "titular impactante",
      "description": "descripción breve",
      "hook": "primera oración del copy"
    }
  ]
}
Genera ${count} objetos en el array "copies" (slotIndex del 0 al ${count - 1}).`

    const res = await fetch(`${OPENAI_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 4000,
            response_format: { type: 'json_object' }
        })
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `OpenAI error ${res.status}`)
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('OpenAI no devolvió contenido')

    try {
        const parsed = JSON.parse(content)
        let copies: AdCopyData[]
        if (Array.isArray(parsed)) {
            copies = parsed
        } else {
            // Find the first array value in the object (handles: copies, ads, anuncios, variaciones, etc.)
            const arrayVal = Object.values(parsed).find(v => Array.isArray(v))
            if (!arrayVal) throw new Error('La respuesta de OpenAI no contiene un array de copies')
            copies = arrayVal as AdCopyData[]
        }
        return copies.slice(0, count)
    } catch (e: any) {
        throw new Error(e.message || 'Error al parsear los copies generados por IA')
    }
}

/** Generates an ad image using DALL-E 3 based on brief */
export async function generateAdImage(params: {
    brief: BusinessBriefData
    mediaType: string
    slotIndex: number
    apiKey: string
    customPrompt?: string
}): Promise<string> {
    const { brief, mediaType, slotIndex, apiKey, customPrompt } = params

    const colorStr = brief.brandColors.slice(0, 2).join(' y ')
    const styleStr = brief.visualStyle.slice(0, 3).join(', ')
    const productContext = brief.contentThemes.slice(0, 2).join(' y ')

    const prompt = customPrompt || `Professional advertising photo for ${brief.name} (${brief.industry} brand).
Style: ${styleStr}, elegant and modern.
Color palette: ${colorStr || 'neutral and clean'}.
Context: ${productContext || brief.description.substring(0, 100)}.
Shot ${slotIndex + 1}: ${mediaType === 'video' ? 'dynamic lifestyle shot' : 'clean product/brand shot'}.
High quality, commercial photography, no text overlay, no watermarks.`

    const res = await fetch(`${OPENAI_BASE}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'dall-e-3',
            prompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural'
        })
    })

    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `DALL-E error ${res.status}`)
    }

    const data = await res.json()
    const url = data.data?.[0]?.url
    if (!url) throw new Error('DALL-E no devolvió una imagen')
    return url
}
