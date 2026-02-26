/**
 * Baileys Manager — Singleton que gestiona múltiples conexiones WhatsApp Web.
 * Una conexión por botId. Sesión guardada en ./baileys-sessions/[botId]/
 */

import makeWASocket, {
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket,
    proto,
    downloadMediaMessage,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import path from 'path'
import fs from 'fs'
import { prisma } from '@/lib/prisma'
import { chat } from '@/lib/openai'
import { toDataURL } from 'qrcode'
import { processFollowUps } from './follow-up-worker'
import { buildSystemPrompt } from './bot-engine'

// ── Types ──────────────────────────────────────────────────────────────────────

export type BaileysStatus = 'disconnected' | 'connecting' | 'qr_ready' | 'connected'

interface BaileysConnection {
    status: BaileysStatus
    qrBase64?: string
    phone?: string
    sock?: WASocket
    openaiKey: string
    reportPhone: string
    botId: string
    botName: string
}

// ── In-memory store (global para sobrevivir Next.js HMR) ──────────────────────
declare global {
    // eslint-disable-next-line no-var
    var __baileys_connections: Map<string, BaileysConnection> | undefined
    // eslint-disable-next-line no-var
    var __follow_up_worker_started: boolean | undefined
}

const connections: Map<string, BaileysConnection> =
    global.__baileys_connections ?? (global.__baileys_connections = new Map())

const SESSIONS_DIR = path.join(process.cwd(), 'baileys-sessions')
const MAX_HISTORY = 20
const BUFFER_DELAY_MS = 15_000
const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

// ── Combinar mensajes del buffer ───────────────────────────────────────────────

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
                case 'audio': return `🎙️ (audio transcrito): ${m.content}`
                case 'image': return `📷 (imagen recibida): ${m.content}`
                default: return `📝 (texto): ${m.content}`
            }
        })
        .join('\n')
}

// ── Message handler ────────────────────────────────────────────────────────────

async function handleMessage(
    conn: BaileysConnection,
    msg: proto.IWebMessageInfo,
) {
    const sock = conn.sock!
    if (!msg.key?.remoteJid) return
    const jid = msg.key.remoteJid

    // Ignorar mensajes propios, grupos y status
    if (
        msg.key.fromMe ||
        jid === 'status@broadcast' ||
        jid.endsWith('@g.us')
    ) return

    // Deduplicación por ID de mensaje
    if (msg.key.id) {
        const exists = await prisma.message.findUnique({ where: { messageId: msg.key.id } })
        if (exists) {
            console.log(`[BAILEYS] Mensaje duplicado ${msg.key.id}, omitiendo`)
            return
        }
    }

    const userPhone = jid.replace('@s.whatsapp.net', '')
    let userName = msg.pushName || ''

    // Si el nombre es puramente numérico, es un fallback del teléfono
    if (userName && /^\d+$/.test(userName.replace(/[+\s-]/g, ''))) {
        userName = ''
    }

    // Extraer contenido del mensaje
    let content = ''
    let msgType: 'text' | 'audio' | 'image' | 'location' = 'text'
    const msgContent = msg.message

    if (msgContent?.conversation) {
        content = msgContent.conversation
        msgType = 'text'
    } else if (msgContent?.extendedTextMessage?.text) {
        content = msgContent.extendedTextMessage.text
        msgType = 'text'
    } else if (msgContent?.audioMessage) {
        msgType = 'audio'
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const buffer = await downloadMediaMessage(msg as any, 'buffer', {})
            const { transcribeAudio } = await import('@/lib/openai')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const blob = new Blob([buffer as any], { type: 'audio/ogg' })
            content = await transcribeAudio(blob, conn.openaiKey)
        } catch {
            content = '[Audio recibido - no se pudo transcribir]'
        }
    } else if (msgContent?.imageMessage) {
        msgType = 'image'
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const buffer = await downloadMediaMessage(msg as any, 'buffer', {})
            const { analyzeImage } = await import('@/lib/openai')
            const b64 = (buffer as Buffer).toString('base64')
            const dataUrl = `data:image/jpeg;base64,${b64}`
            const analysis = await (analyzeImage as any)(dataUrl, conn.openaiKey)
            content = `[Imagen recibida] ${analysis} ${msgContent.imageMessage.caption ? `| Pie de foto: ${msgContent.imageMessage.caption}` : ''}`
        } catch {
            content = msgContent.imageMessage.caption || '[Imagen recibida - error al analizar]'
        }
    } else if (msgContent?.locationMessage || (msgContent as any)?.liveLocationMessage) {
        msgType = 'location'
        const loc = msgContent?.locationMessage || (msgContent as any)?.liveLocationMessage
        const lat = loc.degreesLatitude
        const lon = loc.degreesLongitude
        const name = loc.name || ''
        const address = loc.address || ''
        content = `📍 Ubicación recibida: ${name} ${address}`.trim()
        if (lat && lon) content += ` | https://maps.google.com/?q=${lat},${lon}`
    } else {
        return
    }

    if (!content.trim()) return

    // Verificar si ya compró
    const existingConv = await prisma.conversation.findUnique({
        where: { botId_userPhone: { botId: conn.botId, userPhone } },
        select: { sold: true },
    })
    if (existingConv?.sold) return

    // Marcar como leído
    if (msg.key) {
        await sock.readMessages([msg.key as any]).catch(() => { })
    }

    // --- BUFFER ---
    let conversation = await prisma.conversation.upsert({
        where: { botId_userPhone: { botId: conn.botId, userPhone } },
        update: {
            userName: userName || undefined,
            updatedAt: new Date(),
            followUp1At: null,
            followUp1Sent: false,
            followUp2At: null,
            followUp2Sent: false,
        },
        create: {
            botId: conn.botId,
            userPhone,
            userName,
        },
    })

    const resolvedUserName = userName || conversation.userName || ''
    const conversationId = conversation.id
    const arrivedAt = conversation.updatedAt

    await prisma.message.create({
        data: {
            conversationId,
            role: 'user',
            type: msgType,
            content,
            buffered: true,
            messageId: msg.key.id || undefined,
        },
    })

    await sleep(BUFFER_DELAY_MS)

    const freshConv = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { updatedAt: true },
    })

    if (freshConv && freshConv.updatedAt > arrivedAt) return

    const bufferedMsgs = await prisma.message.findMany({
        where: { conversationId, role: 'user', buffered: true },
        orderBy: { createdAt: 'asc' },
    })

    if (bufferedMsgs.length === 0) return

    const combinedUserText = combineBufferedMessages(bufferedMsgs)

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

    const history = await prisma.message.findMany({
        where: { conversationId, buffered: false },
        orderBy: { createdAt: 'desc' },
        take: MAX_HISTORY,
    })
    const chatHistory = history.reverse().map(m => {
        if (m.role === 'assistant') {
            try {
                const parsed = JSON.parse(m.content)
                return { role: 'assistant' as const, content: [parsed.mensaje1, parsed.mensaje2, parsed.mensaje3].filter(Boolean).join('\n') }
            } catch {
                return { role: 'assistant' as const, content: m.content }
            }
        }
        return { role: m.role as 'user' | 'assistant', content: m.content }
    })

    const bot = await prisma.bot.findUnique({
        where: { id: conn.botId },
        include: { products: { where: { active: true } } },
    })
    if (!bot) return

    const systemPrompt = buildSystemPrompt(
        bot,
        bot.products as Array<Record<string, unknown>>,
        resolvedUserName,
        userPhone,
    )

    const response = await chat(systemPrompt, chatHistory, conn.openaiKey)

    const sendMsg = async (text: string) => {
        await sock.sendPresenceUpdate('composing', jid)
        await sleep(Math.floor(Math.random() * 1000) + 1000)
        await sock.sendMessage(jid, { text })
    }

    if (response.mensaje1) await sendMsg(response.mensaje1)
    for (const photoUrl of response.fotos_mensaje1) {
        if (photoUrl.startsWith('https://')) {
            await sock.sendPresenceUpdate('composing', jid)
            await sleep(500)
            await sock.sendMessage(jid, { image: { url: photoUrl } }).catch(() => { })
        }
    }
    if (response.mensaje2) await sendMsg(response.mensaje2)
    if (response.mensaje3) await sendMsg(response.mensaje3)

    if (response.reporte && conn.reportPhone) {
        const reportJid = `${conn.reportPhone.replace(/^\+/, '')}@s.whatsapp.net`
        if (reportJid) await sock.sendMessage(reportJid, { text: response.reporte }).catch(() => { })

        // Marcar como sold para pausar el bot
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { sold: true, soldAt: new Date() }
        }).catch(() => { })

        console.log(`[BAILEYS] Conversación ${conversationId} finalizada (Reporte generado)`)

        // Etiquetar
        try {
            const labelJid = jid.endsWith('@lid') ? `${userPhone.replace(/\D/g, "")}@s.whatsapp.net` : jid
            await (sock as any).addChatLabel(labelJid, '4')
        } catch { }
    } else {
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
    }

    await prisma.message.create({
        data: {
            conversationId,
            role: 'assistant',
            type: 'text',
            content: JSON.stringify(response),
            buffered: false,
        },
    })
}

export const BaileysManager = {
    getStatus(botId: string) {
        const conn = connections.get(botId)
        if (!conn) return { status: 'disconnected' }
        return { status: conn.status, qrBase64: conn.qrBase64, phone: conn.phone }
    },

    async connect(botId: string, botName: string, openaiKey: string, reportPhone: string) {
        const existing = connections.get(botId)
        if (existing?.status === 'connected' || existing?.status === 'connecting') return

        const sessionDir = path.join(SESSIONS_DIR, botId)
        if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true })

        const conn: BaileysConnection = { status: 'connecting', openaiKey, reportPhone, botId, botName }
        connections.set(botId, conn)

        try {
            const { state, saveCreds } = await useMultiFileAuthState(sessionDir)
            const { version } = await fetchLatestBaileysVersion()
            const sock = makeWASocket({
                version,
                auth: { creds: state.creds, keys: state.keys },
                logger: (require('pino')({ level: 'silent' })),
                browser: ['RUBEN Bot', 'Chrome', '1.0.0'],
            })

            conn.sock = sock
            sock.ev.on('creds.update', saveCreds)
            sock.ev.on('connection.update', async update => {
                const { connection, qr } = update
                if (qr) conn.qrBase64 = await toDataURL(qr), conn.status = 'qr_ready'
                if (connection === 'open') {
                    conn.status = 'connected'
                    const phone = sock.user?.id?.split(':')[0] ?? ''
                    conn.phone = phone
                    await prisma.bot.update({ where: { id: botId }, data: { baileysPhone: phone } }).catch(() => { })
                }
                if (connection === 'close') {
                    conn.status = 'disconnected'
                    connections.delete(botId)
                    setTimeout(() => BaileysManager.connect(botId, botName, openaiKey, reportPhone), 5000)
                }
            })

            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                if (type !== 'notify') return
                for (const msg of messages) await handleMessage(conn, msg).catch(() => { })
            })

        } catch (err) {
            connections.delete(botId)
        }
    },

    disconnect(botId: string) {
        const conn = connections.get(botId)
        if (conn?.sock) conn.sock.logout().catch(() => { })
        connections.delete(botId)
        const sessionDir = path.join(SESSIONS_DIR, botId)
        if (fs.existsSync(sessionDir)) fs.rmSync(sessionDir, { recursive: true, force: true })
        prisma.bot.update({ where: { id: botId }, data: { baileysPhone: null } }).catch(() => { })
    },
}

if (!global.__follow_up_worker_started) {
    global.__follow_up_worker_started = true
    setInterval(() => {
        processFollowUps().catch(() => { })
    }, 60 * 1000)
}
