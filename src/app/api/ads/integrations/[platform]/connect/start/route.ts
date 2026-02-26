import { NextResponse } from 'next/server'
import { AdPlatform } from '@prisma/client'
import { AdapterFactory } from '@/lib/ads/factory'
import { getAuthUser } from '@/lib/auth'

export async function POST(
    req: Request,
    { params }: { params: { platform: string } }
) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const platform = params.platform.toUpperCase() as AdPlatform
    try {
        const adapter = AdapterFactory.getAdapter(platform)
        const authUrl = adapter.getAuthUrl()
        return NextResponse.json({ authUrl })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 })
    }
}
