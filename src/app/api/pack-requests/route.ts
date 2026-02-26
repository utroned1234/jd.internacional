import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const DEFAULT_PRICES: Record<string, number> = {
  BASIC: 49,
  PRO: 99,
  ELITE: 199,
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const requests = await prisma.packPurchaseRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      requests: requests.map(r => ({ ...r, price: Number(r.price) })),
    })
  } catch (err) {
    console.error('[GET /api/pack-requests]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await request.json()
    const plan = (body.plan as string)?.toUpperCase()
    const paymentProofUrl = (body.paymentProofUrl as string) ?? null

    if (!plan || !['BASIC', 'PRO', 'ELITE'].includes(plan)) {
      return NextResponse.json({ error: 'Plan inválido' }, { status: 400 })
    }

    if (!paymentProofUrl) {
      return NextResponse.json({
        error: 'Debes subir tu comprobante de pago para enviar la solicitud.',
      }, { status: 400 })
    }

    // Check no pending request exists
    const existing = await prisma.packPurchaseRequest.findFirst({
      where: { userId: user.id, status: 'PENDING' },
    })

    if (existing) {
      return NextResponse.json({
        error: 'Ya tienes una solicitud pendiente de aprobación. Espera que sea procesada.',
      }, { status: 400 })
    }

    // Get price from settings or defaults
    const priceSetting = await prisma.appSetting.findUnique({
      where: { key: `PRICE_${plan}` },
    })
    const price = priceSetting ? parseFloat(priceSetting.value) : DEFAULT_PRICES[plan]

    const req = await prisma.packPurchaseRequest.create({
      data: {
        userId: user.id,
        plan: plan as any,
        price,
        paymentProofUrl,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, request: { ...req, price: Number(req.price) } })
  } catch (err) {
    console.error('[POST /api/pack-requests]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
