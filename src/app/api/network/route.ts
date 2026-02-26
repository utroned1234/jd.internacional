import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getLevels(rootId: string, maxLevels = 5) {
  const result: { level: number; count: number; active: number; members: { username: string; fullName: string; isActive: boolean }[] }[] = []
  let parentIds = [rootId]

  for (let level = 1; level <= maxLevels; level++) {
    const members = await prisma.user.findMany({
      where: { sponsorId: { in: parentIds } },
      select: { id: true, username: true, fullName: true, isActive: true },
      orderBy: { createdAt: 'asc' },
    })

    if (members.length === 0) break

    result.push({
      level,
      count: members.length,
      active: members.filter(m => m.isActive).length,
      members: members.map(m => ({ username: m.username, fullName: m.fullName, isActive: m.isActive })),
    })

    parentIds = members.map(m => m.id)
  }

  return result
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const [levels, commissionsAgg, recentBonuses] = await Promise.all([
      getLevels(user.id),
      prisma.commission.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      }),
      prisma.commission.findMany({
        where: { userId: user.id, type: 'SPONSORSHIP_BONUS' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    const totalNetwork = levels.reduce((s, l) => s + l.count, 0)
    const totalActive  = levels.reduce((s, l) => s + l.active, 0)

    return NextResponse.json({
      referralCode: user.referralCode,
      user: {
        fullName:     user.fullName,
        username:     user.username,
        referralCode: user.referralCode,
        isActive:     user.isActive,
        avatarUrl:    (user as any).avatarUrl ?? null,
      },
      levels,
      recentBonuses: recentBonuses.map(b => ({
        id:          b.id,
        amount:      Number(b.amount),
        description: b.description,
        createdAt:   b.createdAt,
      })),
      stats: {
        directReferrals:   levels[0]?.count ?? 0,
        totalNetwork,
        totalActive,
        totalLevels:       levels.length,
        totalCommissions:  Number(commissionsAgg._sum.amount ?? 0),
        pendingBalance:    0,
      },
    })
  } catch (err) {
    console.error('[GET /api/network]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
