import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json()

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Usuario/correo y contrasena son obligatorios' }, { status: 400 })
    }

    // Buscar por email o username
    const isEmail = identifier.includes('@')
    const user = await prisma.user.findFirst({
      where: isEmail
        ? { email: identifier.toLowerCase().trim() }
        : { username: identifier.trim() }
    })

    if (!user) {
      return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 })
    }

    const isValid = await verifyPassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json({ error: 'Credenciales invalidas' }, { status: 401 })
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 })
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
      email: user.email,
    })

    const response = NextResponse.json({
      message: 'Inicio de sesion exitoso',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        referralCode: user.referralCode,
      }
    })

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
