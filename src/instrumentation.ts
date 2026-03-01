export async function register() {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
        try {
            const { prisma } = await import('@/lib/prisma')
            const { BaileysManager } = await import('@/lib/baileys-manager')
            const { decrypt } = await import('@/lib/crypto')

            const bots = await prisma.bot.findMany({
                where: {
                    type: 'BAILEYS',
                    status: 'ACTIVE',
                    baileysPhone: { not: null },
                },
                include: { secret: true },
            })

            for (const bot of bots) {
                if (!bot.secret) continue
                const openaiKey = decrypt(bot.secret.openaiApiKeyEnc)
                if (!openaiKey) continue
                console.log(`[STARTUP] Reconectando bot Baileys: ${bot.name}`)
                BaileysManager.connect(bot.id, bot.name, openaiKey, bot.secret.reportPhone ?? '')
                    .catch(err => console.error(`[STARTUP] Error reconectando bot ${bot.id}:`, err))
            }
        } catch (err) {
            console.error('[STARTUP] Error al inicializar bots Baileys:', err)
        }
    }
}
