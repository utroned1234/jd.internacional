import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brief = await (prisma as any).businessBrief.findFirst({
        where: { userId: user.id, isActive: true },
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ brief })
}

export async function POST(req: Request) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
        name, industry, description, valueProposition,
        painPoints, interests, brandVoice, brandColors,
        visualStyle, primaryObjective, mainCTA, targetLocations,
        keyMessages, personalityTraits, contentThemes, engagementLevel
    } = body

    if (!name || !industry || !description) {
        return NextResponse.json({ error: 'Nombre, industria y descripción son requeridos' }, { status: 400 })
    }

    // Deactivate previous briefs
    await (prisma as any).businessBrief.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false }
    })

    const brief = await (prisma as any).businessBrief.create({
        data: {
            userId: user.id,
            name: name.trim(),
            industry: industry.trim(),
            description: description.trim(),
            valueProposition: (valueProposition || '').trim(),
            painPoints: painPoints || [],
            interests: interests || [],
            brandVoice: (brandVoice || 'casual').trim(),
            brandColors: brandColors || [],
            visualStyle: visualStyle || [],
            primaryObjective: primaryObjective || 'conversion',
            mainCTA: (mainCTA || 'Comprar ahora').trim(),
            targetLocations: targetLocations || [],
            keyMessages: keyMessages || [],
            personalityTraits: personalityTraits || [],
            contentThemes: contentThemes || [],
            engagementLevel: engagementLevel || 'medio',
            isActive: true
        }
    })

    return NextResponse.json({ brief }, { status: 201 })
}

export async function PUT(req: Request) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { id, ...updates } = body

    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const brief = await (prisma as any).businessBrief.findFirst({
        where: { id, userId: user.id }
    })
    if (!brief) return NextResponse.json({ error: 'Brief no encontrado' }, { status: 404 })

    const updated = await (prisma as any).businessBrief.update({
        where: { id },
        data: {
            ...updates,
            updatedAt: new Date()
        }
    })

    return NextResponse.json({ brief: updated })
}
