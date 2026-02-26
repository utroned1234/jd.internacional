/**
 * BotEngine – core processing logic for WhatsApp bots.
 * Handles incoming YCloud webhook payloads end-to-end.
 *
 * ─── SISTEMA DE BUFFER ────────────────────────────────────────────────────────
 * Cuando un usuario envía varios mensajes rápido (texto + audio + imagen):
 *  1. Cada mensaje llega, se transcribe/analiza y se guarda como buffered=true
 *  2. Se espera BUFFER_DELAY_MS (15 sg) para acumular todos los mensajes
 *  3. El ÚLTIMO mensaje en llegar es el "ganador" y procesa todos juntos
 *  4. Los mensajes buffered se eliminan de DB y se combinan en 1 solo contexto
 *  5. Ese contexto combinado se envía a OpenAI para generar la respuesta
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { prisma } from './prisma'
import { decrypt } from './crypto'
import { transcribeAudio, analyzeImage, chat, ChatMessage } from './openai'
import { markAsRead, sendText, sendImage } from './ycloud'

/** Tiempo de espera del buffer en milisegundos (15 segundos). */
const BUFFER_DELAY_MS = 15_000

/** Máximo de mensajes de historial previo que se pasan a OpenAI. */
const MAX_HISTORY_MESSAGES = 20

/** Pausa de N milisegundos. */
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// ─── YCloud payload normalization ─────────────────────────────────────────────

interface NormalizedMessage {
  msgId: string
  userPhone: string
  userName: string
  type: 'text' | 'audio' | 'image' | 'location'
  text?: string
  audioUrl?: string
  imageUrl?: string
  locationLat?: number
  locationLon?: number
}

function normalizePayload(payload: Record<string, unknown>): NormalizedMessage | null {
  try {
    // YCloud v2 real format: { type, whatsappInboundMessage: { id, wamid, from, type, text, ... } }
    // Fallbacks for other envelope styles
    const msg =
      payload.whatsappInboundMessage ??
      (payload.data as Record<string, unknown>)?.message ??
      payload.message ??
      payload

    const m = msg as Record<string, unknown>

    // Usar wamid como ID de deduplicación (ID real de WhatsApp)
    const msgId = (m.wamid ?? m.id ?? m.messageId ?? '') as string
    const userPhone = (m.from ?? '') as string
    const profile = (m.customerProfile ?? m.contact ?? {}) as Record<string, unknown>
    let userName = ((profile.name ?? profile.displayName ?? '') as string) || ''

    // Si el nombre es puramente numérico, es un fallback del teléfono, lo limpiamos
    if (userName && /^\d+$/.test(userName.replace(/[+\s-]/g, ''))) {
      userName = ''
    }

    const type = (m.type ?? 'text') as string

    if (!userPhone) return null

    if (type === 'text') {
      const textObj = m.text as Record<string, unknown> | undefined
      const body = (textObj?.body ?? m.body ?? '') as string
      return { msgId, userPhone, userName, type: 'text', text: body }
    }

    if (type === 'audio' || type === 'voice') {
      const audioObj = (m.audio ?? m.voice ?? {}) as Record<string, unknown>
      const audioUrl = (audioObj.link ?? audioObj.url ?? audioObj.id ?? '') as string
      return { msgId, userPhone, userName, type: 'audio', audioUrl }
    }

    if (type === 'image') {
      const imgObj = (m.image ?? {}) as Record<string, unknown>
      const imageUrl = (imgObj.link ?? imgObj.url ?? imgObj.id ?? '') as string
      return { msgId, userPhone, userName, type: 'image', imageUrl }
    }

    if (type === 'location') {
      const loc = (m.location ?? {}) as Record<string, unknown>
      return {
        msgId,
        userPhone,
        userName,
        type: 'location',
        locationLat: (loc.latitude ?? loc.lat) as number,
        locationLon: (loc.longitude ?? loc.lon ?? loc.lng) as number,
        text: `${loc.name || ''} ${loc.address || ''}`.trim(),
      }
    }

    // Tipo desconocido – tratar como texto
    return { msgId, userPhone, userName, type: 'text', text: `[Mensaje tipo: ${type}]` }
  } catch {
    return null
  }
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildSystemPrompt(
  bot: { name: string; systemPromptTemplate: string | null; maxCharsMensaje1: number | null; maxCharsMensaje2: number | null; maxCharsMensaje3: number | null },
  products: Array<Record<string, unknown>>,
  userName?: string | null,
  userPhone?: string | null,
): string {
  // Limpieza final: si userName parece un teléfono, usar 'cliente'
  const isNumeric = userName && /^\d+$/.test(userName.replace(/[+\s-]/g, ''))
  const nameToUse = (userName && !isNumeric) ? userName : 'cliente'
  const productBlock = products
    .map(p => {
      const allImgs = Array.isArray(p.imageMainUrls) ? (p.imageMainUrls as string[]) : []
      const mainImgs = allImgs.slice(0, 3)
      const moreImgs = allImgs.slice(3, 8)

      const hooks = Array.isArray(p.hooks) ? (p.hooks as string[]) : []

      const rawTestis = Array.isArray(p.testimonialsVideoUrls) ? p.testimonialsVideoUrls : []
      const testimonials = (rawTestis as Array<unknown>)
        .map(item => {
          if (typeof item === 'object' && item !== null && (item as { url?: string }).url) {
            const obj = item as { url: string; label?: string }
            return { url: obj.url, label: obj.label || '' }
          }
          if (typeof item === 'string' && item.startsWith('http')) return { url: item, label: '' }
          return null
        })
        .filter((t): t is { url: string; label: string } => t !== null)

      const currencySymbols: Record<string, string> = {
        USD: '$', EUR: '€', BOB: 'Bs.', PEN: 'S/',
        COP: '$', ARS: '$', MXN: '$', CLP: '$', UYU: '$', CUP: '$',
        GTQ: 'Q', HNL: 'L', NIO: 'C$', CRC: '₡',
        PAB: 'B/.', DOP: 'RD$', PYG: '₲', BRL: 'R$', VES: 'Bs.S',
      }
      const currency = (p.currency as string | undefined) ?? 'USD'
      const sym = currencySymbols[currency] ?? currency

      return [
        `### PRODUCTO: ${p.name}`,
        p.category ? `Categoría: ${p.category}` : '',
        p.benefits ? `Beneficios: ${p.benefits}` : '',
        p.usage ? `Uso / Modo de uso: ${p.usage}` : '',
        p.warnings ? `Advertencias: ${p.warnings}` : '',
        `Primer mensaje del producto identificado: "${p.firstMessage || ''}"`,
        `Precios:`,
        p.priceUnit ? `- Precio unitario: ${sym}${p.priceUnit} (${currency})` : '',
        p.pricePromo2 ? `- Precio promo ×2: ${sym}${p.pricePromo2} (${currency})` : '',
        p.priceSuper6 ? `- Precio súper ×6: ${sym}${p.priceSuper6} (${currency})` : '',
        `Imágenes principales (enviar solo 1 la primera vez): ${JSON.stringify(mainImgs)}`,
        `Más fotos del producto: ${JSON.stringify(moreImgs)}`,
        `Fotos de testimonios: ${JSON.stringify(testimonials)}`,
        p.shippingInfo ? `Info envío: ${p.shippingInfo}` : '',
        p.coverage ? `Cobertura: ${p.coverage}` : '',
        hooks.length > 0 ? `Hooks/Gatillos: ${hooks.join(', ')}` : '',
      ].filter(Boolean).join('\n')
    })
    .join('\n\n')

  const maxM1 = bot.maxCharsMensaje1 ?? 60
  const maxM2 = bot.maxCharsMensaje2 ?? 50
  const maxM3 = bot.maxCharsMensaje3 ?? 50

  return `
# 👤 CLIENTE ACTUAL

- Nombre: ${nameToUse}
- Teléfono: ${userPhone ? userPhone.replace(/^\+/, '') : 'desconocido'}

---

# 🎯 IDENTIDAD

Eres Rubén, vendedor profesional de WhatsApp (Bolivia). Hombre, amable, directo y humano.

Tono: corto, cálido, cercano y boliviano.

- Con mujeres: señorita / casera / estimada / amiga / ${nameToUse}
- Con hombres: estimado / ${nameToUse}

Nunca inventas datos. Siempre presionas de forma ética hacia la compra.

---

# 🧠 SECUENCIA PRINCIPAL

## 1. Dar un bienvenida cálida y amigable y luego Identificación del producto (OBLIGATORIO)

Antes de cualquier respuesta, identifica el producto de interés.

Si no está identificado:

- NO envíes bienvenida, precios, fotos ni beneficios.
- Pregunta amablemente: "¿Qué producto te interesa?"

El flujo no avanza hasta que el producto esté identificado.

---

## 2. Primera interacción (solo si el producto ya fue identificado)

Si es la primera vez que el usuario consulta sobre ese producto:

- Enviar el texto exacto del campo "Primer mensaje del producto identificado".
- NO incluir precios en este mensaje.
- Enviar 1 foto de "Imágenes principales" en fotos_mensaje1 (solo se puede enviar una vez).
- Añadir gatillos mentales suaves: transformación, autoridad, prueba social.

Una vez enviado el primer mensaje y la primera foto "Imágenes principales"  → no repetirlo en ningún turno posterior.

---

## 3. Detección de intención

Detecta una sola intención dominante por turno:
Interés / Duda / Precio / Comparación / Compra / Entrega

Máximo 3 mensajes por turno.

---

## 4. Precios

Solo informa precios si el usuario los solicita explícitamente.

- Precio unitario → cuando quiere 1 unidad.
- Precio promo ×2 o Precio súper ×6 → cuando quiere 2 o más unidades.

Usa gatillos de: ahorro, urgencia y beneficio inmediato.

NUNCA inventas montos. Usa solo los precios de la base de conocimiento del producto.

## 5. Fotos (usar solo si el usuario pide mas fotos del producto identificado)

- Envía fotos reales desde "**Más fotos del producto”**.

---

## 6. Testimonios y confianza (usar testimonios solo si existe)

Si detectas duda, inseguridad o el usuario pide evidencias:

- Envía fotos de testimonios reales desde "Fotos de testimonios" según la ocasión.
- No repitas la misma foto en la misma conversación.
- Acompaña con prueba social y credibilidad.

---

## **7. Comparación y cierre**

Guía suave hacia la decisión:

- Resaltar beneficios del producto.
- Mostrar resultados potenciales o transformación (sin inventar).
- Los mensajes deben avanzar hacia:
    - Confirmación de compra
    - Datos de entrega
    - Selección de variante

Siempre con amabilidad y claridad.

---

# 📍 **DIRECCIÓN**

Válida si incluye:

- Ciudad
- Calle
- Zona
- Nº (si existe)
    
    o coordenadas / link Maps.
    

Si falta algo → pedir solo lo faltante o direccion en gps (vaidar cordenadas).

Si es de provincia no pedir direccion detallada enves de eso preguntar por que linia de transporte le gustaria que se lo mandemos en cuanto confirme pasar a (CONFIRMACION)

No repetir datos ya enviados.

---

# 📦 **CONFIRMACIÓN**

Se confirma solo si hay dirección completa o coordenadas válidas.

El pago se coordina directo con asesor que se va a comunicar.

Mensaje obligatorio:

\`\`\`
¡Gracias por tu confianza, ${userName || '[nombre]'}! 🚚💚

Recibí tu dirección:

📍 [dirección o coordenadas]

Entrega estimada: dentro las primeras 8–24 horas despues del pedido.

Un encargado te llamará para coordinar ⭐
\`\`\`

---

# 📝 **REPORTE (solo si hubo confirmación)**

\`\`\`
"Hola *Ruben*, nuevo pedido de ${nameToUse}.
Contacto: ${(userPhone || '').replace(/^\+/, '')} (Solo el numero de tefono sin textos).
Dirección: [dirección o coordenadas].
Descripción: [producto]."
\`\`\`

Si no hubo confirmación → \`"reporte": ""\`.

---

# 🚨 REGLA OBLIGATORIA (NO NEGOCIABLE)

Está prohibido inventar datos.
Toda la información debe obtenerse únicamente de la base de conocimiento del producto.

---

# 🧩 REGLAS GENERALES

- Tono cálido, cercano, empático y natural con acento boliviano.
- No repetir fotos ni URLs de testimonios ya enviados.
- No dar precios en los primeros mensajes.
- En dudas → usar testimonios.
- No pedir datos ya recibidos.
- No ofrecer productos ya cerrados.
- Usar *negritas con un asterisco por lado*.
- 2 saltos de línea entre bloques de texto.
- Responder siempre aunque el input llegue vacío: usar el historial.
- Mensajes cortos, claros y humanos.

---

# 🔥 GATILLOS MENTALES (VENTA ÉTICA)

- Urgencia, escasez, autoridad, prueba social, transformación.
- Insistir de forma estratégica, amigable y respetuosa.
- Objetivo principal: cerrar la venta.
- Después de la confirmación → NO seguir vendiendo.

---

# 📏 REGLAS DE MENSAJES

## mensaje1

- Si es el primer mensaje del producto: enviar el texto completo tal cual.
- Si no: máx. ${maxM1} caracteres. Con emojis. Sin preguntas. 2 saltos entre frases.

## mensaje2 (opcional)

- Máx. ${maxM2} caracteres. Pregunta suave o llamada a la acción.

## mensaje3 (opcional)

- Máx. ${maxM3} caracteres. Emoción, gatillo o pregunta de cierre.

Usar solo 1 o 2 mensajes por turno.
Usar mensaje2 y mensaje3 SOLO si realmente aportan valor.

## Regla estricta

- Jamás superar el límite de caracteres por mensaje.
- Resaltar palabras clave con *negrita de un asterisco*.
- Separar bloques con 2 saltos de línea.

---

# 🧠 REGLA FINAL

  Siempre generar una respuesta aunque no llegue texto nuevo.
  Leer el historial completo y responder con coherencia y continuidad.

---

# 📝 **REPORTE DE PEDIDO (solo si hubo confirmación)**

Si el cliente confirma la compra, el campo "reporte" DEBE contener un resumen detallado con este formato:
- Producto: [Nombre]
- Cantidad: [Número]
- Total: [Monto y moneda]
- Cliente: [Nombre completo]
- Teléfono: [Número]
- Dirección de envío: [Detalles proporcionados]
- Notas extras: [Cualquier observación relevante]

Si no hubo confirmación de compra → "reporte": ""

---

# 🧩 BASE DE CONOCIMIENTO (CATÁLOGO)

${productBlock}

---

# 📦 FORMATO DE SALIDA (OBLIGATORIO)

\`\`\`json
{
  "mensaje1": "Primer bloque de texto",
  "mensaje2": "Opcional: aclaración o pregunta",
  "mensaje3": "Opcional: cierre o instrucción",
  "fotos_mensaje1": [],
  "reporte": "Resumen detallado del pedido si hubo confirmación"
}
\`\`\`
`.trim()
}

// ─── Combinar mensajes del buffer ─────────────────────────────────────────────

interface BufferedMsg {
  id: string
  type: string
  content: string
  createdAt: Date
}

function combineBufferedMessages(messages: BufferedMsg[]): string {
  const sorted = [...messages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())

  return sorted
    .map(m => {
      switch (m.type) {
        case 'audio': return `🎙️ (audio transcrito): ${m.content} `
        case 'image': return `📷 (imagen analizada): ${m.content} `
        case 'location': return `📍 (ubicación): ${m.content}`
        default: return `📝 (texto): ${m.content}`
      }
    })
    .join('\n')
}

// ─── Main engine ─────────────────────────────────────────────────────────────

export class BotEngine {
  static async handleWebhook(botId: string, payload: Record<string, unknown>): Promise<void> {

    // 1. Cargar bot con credenciales
    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { secret: true },
    })

    if (!bot || bot.status !== 'ACTIVE' || !bot.secret) {
      console.warn(`[BOT] Bot ${botId} no activo o sin credenciales`)
      return
    }

    // 2. Normalizar payload de YCloud
    const norm = normalizePayload(payload)
    if (!norm) {
      console.warn(`[BOT] No se pudo normalizar payload para bot ${botId} `)
      return
    }

    const { msgId, userPhone, userName, type } = norm

    // 🔍 Debug: loguear nombre del cliente recibido desde webhook
    console.log(`[BOT] Mensaje de ${userPhone} | Nombre recibido: "${userName || '(sin nombre)'}" | Tipo: ${type}`)

    // 3. Deduplicación por messageId de YCloud
    if (msgId) {
      const exists = await prisma.message.findUnique({ where: { messageId: msgId } })
      if (exists) {
        console.log(`[BOT] Mensaje duplicado ${msgId}, omitiendo`)
        return
      }
    }

    const apiKey = decrypt(bot.secret.ycloudApiKeyEnc)
    const openaiKey = decrypt(bot.secret.openaiApiKeyEnc)
    const from = bot.secret.whatsappInstanceNumber
    const reportPhone = bot.secret.reportPhone

    // Normalizar teléfono: YCloud espera E.164 sin '+' (ej: "59172794224" no "+59172794224")
    const toPhone = userPhone.replace(/^\+/, '').replace(/\s/g, '')

    // ─── Verificar si el usuario ya compró ───────────────────────────────────
    const existingConv = await prisma.conversation.findUnique({
      where: { botId_userPhone: { botId, userPhone } },
      select: { sold: true },
    })
    if (existingConv?.sold) {
      // Ya compró: NO marcar como leído (el vendedor verá el icono de mensaje)
      console.log(`[BOT] Usuario ${userPhone} ya compró, ignorando mensaje`)
      return
    }

    // 4. Marcar como leído (solo si no ha comprado)
    if (msgId) markAsRead(msgId, apiKey).catch(() => { })

    // 5. Procesar tipo de mensaje → transcribir audio / analizar imagen
    //    Se hace ANTES del buffer para que el contenido esté listo al guardarse
    let userText = ''
    let resolvedType: 'text' | 'audio' | 'image' | 'location' = 'text'

    try {
      if (type === 'text') {
        userText = norm.text || ''
        resolvedType = 'text'
      } else if (type === 'audio') {
        resolvedType = 'audio'
        userText = norm.audioUrl
          ? await transcribeAudio(norm.audioUrl, openaiKey)
          : '[Audio recibido – sin URL]'
      } else if (type === 'image') {
        resolvedType = 'image'
        userText = norm.imageUrl
          ? `[Imagen enviada] ${await analyzeImage(norm.imageUrl, openaiKey)} `
          : '[Imagen recibida – sin URL]'
      } else if (type === 'location') {
        resolvedType = 'location'
        const lat = norm.locationLat
        const lon = norm.locationLon
        const desc = norm.text ? `${norm.text} ` : ''
        userText = `📍 Ubicación recibida: ${desc}`.trim()
        if (lat && lon) userText += ` | https://maps.google.com/?q=${lat},${lon}`
      }
    } catch (err) {
      console.error(`[BOT] Error procesando media:`, err)
      userText = '[Error procesando media]'
    }

    if (!userText.trim()) {
      console.warn(`[BOT] Texto vacío después de procesar mensaje para bot ${botId}`)
      return
    }

    // 6. Buscar o crear conversación y resetear seguimientos (el usuario respondió)
    // Actualizamos updatedAt para que el buffer de 15s sepa que llegó un nuevo mensaje
    let conversation = await prisma.conversation.upsert({
      where: { botId_userPhone: { botId, userPhone } },
      update: {
        userName: norm.userName || undefined,
        updatedAt: new Date(), // Disparar el buffer
        followUp1At: null,
        followUp1Sent: false,
        followUp2At: null,
        followUp2Sent: false,
      },
      create: {
        botId,
        userPhone,
        userName: norm.userName,
        botState: { create: { welcomeSent: false } },
      },
      include: { botState: true },
    })

    const conversationId = conversation.id
    const welcomeSent = conversation.botState?.welcomeSent ?? false
    const arrivedAt = conversation.updatedAt

    // ✅ CRÍTICO: Si el webhook actual no trae nombre, usar el guardado en BD
    const resolvedUserName = norm.userName || conversation.userName || ''

    // 7. Guardar mensaje en buffer (buffered = true)
    //    El contenido ya está procesado (texto transcrito, imagen descrita)
    await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        type: resolvedType,
        content: userText,
        buffered: true,
        messageId: msgId || undefined,
      },
    })

    console.log(`[BOT] Buffer: mensaje guardado (${resolvedType}) para ${userPhone}, esperando ${BUFFER_DELAY_MS / 1000}s...`)

    // ─── Buffer: esperar 15 segundos ─────────────────────────────────────────
    // Si llega otro mensaje durante ese tiempo, conversation.updatedAt cambia.
    // Comparamos con arrivedAt: si cambió, este mensaje pertenece a un batch
    // que será procesado por el último en llegar (el "ganador").
    await sleep(BUFFER_DELAY_MS)

    const freshConv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { updatedAt: true },
    })

    if (freshConv && freshConv.updatedAt > arrivedAt) {
      // Hay un mensaje más reciente → ese será el ganador del buffer
      console.log(`[BOT] Buffer: mensaje de ${userPhone} cedido al más reciente`)
      return
    }
    // ─────────────────────────────────────────────────────────────────────────
    // A partir de aquí: SOMOS EL GANADOR del buffer

    // 8. Cargar todos los mensajes pendientes del buffer (buffered = true)
    const bufferedMsgs = await prisma.message.findMany({
      where: { conversationId, role: 'user', buffered: true },
      orderBy: { createdAt: 'asc' },
    })

    if (bufferedMsgs.length === 0) {
      console.warn(`[BOT] No hay mensajes en buffer para procesar (${userPhone})`)
      return
    }

    console.log(`[BOT] Buffer: procesando ${bufferedMsgs.length} mensaje(s) combinados para ${userPhone}`)

    // 9. Combinar todos los mensajes del buffer en un solo contexto
    const combinedUserText = combineBufferedMessages(bufferedMsgs)

    // 10. Eliminar mensajes del buffer y guardar el mensaje combinado en una transacción
    //     Esto asegura que no perdamos los mensajes si algo falla en medio del proceso.
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: { conversationId, role: 'user', buffered: true },
      }),
      prisma.message.create({
        data: {
          conversationId,
          role: 'user',
          type: 'text',
          content: combinedUserText,
          buffered: false,
        },
      }),
    ])

    // 12. Cargar historial reciente (los últimos N mensajes, orden cronológico)
    // Se ordena DESC para tomar los más recientes, luego se invierte para el prompt.
    const recentMessages = await prisma.message.findMany({
      where: { conversationId, buffered: false },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES,
    })
    recentMessages.reverse() // volver a cronológico (asc) para OpenAI

    const chatHistory: ChatMessage[] = recentMessages.map(m => {
      if (m.role === 'assistant') {
        // Extraer texto legible del JSON del asistente para que el historial sea natural
        try {
          const parsed = JSON.parse(m.content) as Record<string, unknown>
          const parts = [
            parsed.mensaje1,
            parsed.mensaje2,
            parsed.mensaje3,
          ].filter(Boolean).join('\n')
          return { role: 'assistant' as const, content: parts || m.content }
        } catch {
          return { role: 'assistant' as const, content: m.content }
        }
      }
      return { role: m.role as 'user', content: m.content }
    })

    // 13. Cargar productos activos del bot
    const products = await prisma.product.findMany({
      where: { botId, active: true },
    })

    // 14. Construir system prompt y llamar a OpenAI
    const systemPrompt = buildSystemPrompt(
      bot,
      products as Array<Record<string, unknown>>,
      resolvedUserName, // ← Nombre real del cliente (desde webhook o desde BD)
      userPhone,
    )

    const response = await chat(systemPrompt, chatHistory, openaiKey)

    // 15. Enviar respuestas vía YCloud
    console.log(`[BOT] Enviando respuesta → from=${from} to=${toPhone}`)
    console.log(`[BOT] mensaje1: ${response.mensaje1?.slice(0, 60)}`)

    if (response.mensaje1) {
      await sendText(from, toPhone, response.mensaje1, apiKey).catch(e =>
        console.error('[BOT] sendText m1 ERROR:', e.message),
      )
      await sleep(Math.floor(Math.random() * 1000) + 1000) // Retardo humano 1-2s
    }

    for (const photoUrl of response.fotos_mensaje1) {
      if (photoUrl.startsWith('https://')) {
        await sendImage(from, toPhone, photoUrl, apiKey).catch(e =>
          console.error('[BOT] sendImage ERROR:', e.message),
        )
      }
    }

    if (response.mensaje2) {
      await sendText(from, toPhone, response.mensaje2, apiKey).catch(e =>
        console.error('[BOT] sendText m2 ERROR:', e.message),
      )
      await sleep(Math.floor(Math.random() * 1000) + 1000) // Retardo humano 1-2s
    }

    if (response.mensaje3) {
      await sendText(from, toPhone, response.mensaje3, apiKey).catch(e =>
        console.error('[BOT] sendText m3 ERROR:', e.message),
      )
    }

    if (response.reporte && reportPhone) {
      await sendText(from, reportPhone.replace(/^\+/, ''), response.reporte, apiKey).catch(e =>
        console.error('[BOT] sendReport ERROR:', e.message),
      )

      // Marcar como sold para que el bot no siga respondiendo
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { sold: true, soldAt: new Date() }
      }).catch(() => { })

      console.log(`[BOT] Conversación ${conversationId} finalizada (Reporte generado para ${userPhone})`)
    } else {
      // Si NO es sold, programar seguimientos automáticos
      const now = new Date()
      await prisma.conversation.update({
        where: { id: conversationId },
        data: {
          followUp1At: new Date(now.getTime() + (bot.followUp1Delay || 15) * 60 * 1000),
          followUp1Sent: false,
          followUp2At: new Date(now.getTime() + (bot.followUp2Delay || 4320) * 60 * 1000),
          followUp2Sent: false,
        },
      }).catch(() => { })
      console.log(`[BOT] Seguimientos programados: ${bot.followUp1Delay}m y ${bot.followUp2Delay}m`)
    }

    // 16. Guardar respuesta del asistente
    await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        type: 'text',
        content: JSON.stringify(response),
        buffered: false,
      },
    })

    // 17. Actualizar estado del bot (solo botState, NO conversation.updatedAt)
    // IMPORTANTE: no actualizar conversation.updatedAt aquí porque interferiría
    // con el buffer de mensajes que llegan mientras el winner está procesando.
    const stateUpdates: Record<string, unknown> = {}
    if (!welcomeSent && response.mensaje1) {
      stateUpdates.welcomeSent = true
      stateUpdates.welcomeSentAt = new Date()
    }
    if (response.reporte) {
      stateUpdates.lastIntent = 'confirmation'
    }

    await prisma.botState.update({
      where: { conversationId },
      data: stateUpdates,
    })

    console.log(`[BOT] ✓ Respuesta enviada para bot=${botId} phone=${userPhone} (${bufferedMsgs.length} msgs procesados)`)
  }
}
