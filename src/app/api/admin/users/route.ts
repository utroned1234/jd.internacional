import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorizedAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedAdmin()

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('q') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const take = 20

  const where = search
    ? {
        OR: [
          { username: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        country: true,
        plan: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { referrals: true } },
        commissions: { select: { amount: true } },
      },
      orderBy: { createdAt: 'desc' },
      take,
      skip: (page - 1) * take,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({
    users: users.map(({ commissions, ...u }) => ({
      ...u,
      totalCommissions: commissions.reduce((s, c) => s + Number(c.amount), 0),
    })),
    total,
    pages: Math.ceil(total / take),
    page,
  })
}
