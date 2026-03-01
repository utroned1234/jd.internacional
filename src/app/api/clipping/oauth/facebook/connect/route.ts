import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth'

export async function GET() {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const appId = process.env.META_APP_ID!
  const redirectUri = process.env.META_CLIPPING_REDIRECT_URI!

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    response_type: 'code',
    // pages_show_list: list user's pages
    // pages_read_engagement: read video views on pages
    scope: 'pages_show_list,pages_read_engagement',
  })

  return NextResponse.redirect(
    `https://www.facebook.com/v25.0/dialog/oauth?${params.toString()}`
  )
}
