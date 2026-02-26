import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        if (!file) {
            return NextResponse.json({ error: 'No se subió ningún archivo' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const ext = file.name.split('.').pop()
        const fileName = `${randomUUID()}.${ext}`

        // Subir a Supabase Storage
        const { data, error } = await supabaseAdmin.storage
            .from('uploads')
            .upload(fileName, buffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            })

        if (error) {
            console.error('[SUPABASE STORAGE ERROR]', error)
            return NextResponse.json({ error: 'Error al subir a Supabase Storage' }, { status: 500 })
        }

        // Obtener URL pública
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('uploads')
            .getPublicUrl(fileName)

        return NextResponse.json({ url: publicUrl })
    } catch (err) {
        console.error('[POST /api/upload]', err)
        return NextResponse.json({ error: 'Error al subir archivo' }, { status: 500 })
    }
}
