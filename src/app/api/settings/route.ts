import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Public endpoint — returns only non-sensitive settings users need
const PUBLIC_KEYS = ['PAYMENT_QR_URL', 'PRICE_BASIC', 'PRICE_PRO', 'PRICE_ELITE']

export async function GET() {
  try {
    const settings = await prisma.appSetting.findMany({
      where: { key: { in: PUBLIC_KEYS } },
    })

    const map: Record<string, string> = {}
    settings.forEach(s => { map[s.key] = s.value })

    return NextResponse.json({ settings: map })
  } catch (err) {
    console.error('[GET /api/settings]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
