import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { encrypt } from '@/lib/encryption'

// Mock User ID
const MOCK_USER_ID = '0d7be653-0d1d-412c-a6a1-85e294a4db1c'

export async function POST(request: Request) {
    try {
        const userId = MOCK_USER_ID
        const { serviceAccountEmail, privateKey } = await request.json()

        if (!serviceAccountEmail || !privateKey) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
        }

        await prisma.googleCredential.upsert({
            where: { userId },
            update: {
                serviceAccountEmail,
                privateKey: encrypt(privateKey)
            },
            create: {
                userId,
                serviceAccountEmail,
                privateKey: encrypt(privateKey)
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving Google config:', error)
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    try {
        const userId = MOCK_USER_ID
        const credential = await prisma.googleCredential.findUnique({
            where: { userId }
        })

        return NextResponse.json({
            configured: !!credential,
            serviceAccountEmail: credential?.serviceAccountEmail || ''
        })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 })
    }
}
