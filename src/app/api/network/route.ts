import { NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface TreeNode {
  id: string
  username: string
  fullName: string
  isActive: boolean
  plan: string
  level: number
  directCount: number   // direct children
  children: TreeNode[]
}

async function buildTree(rootId: string, maxLevels = 50) {
  // BFS — max 5 queries (one per level)
  type Raw = { id: string; username: string; fullName: string; isActive: boolean; plan: string; sponsorId: string | null; level: number; children: Raw[] }
  const map = new Map<string, Raw>()
  let levelIds = [rootId]
  let total = 0, active = 0

  for (let level = 1; level <= maxLevels; level++) {
    const members = await prisma.user.findMany({
      where: { sponsorId: { in: levelIds } },
      select: { id: true, username: true, fullName: true, isActive: true, plan: true, sponsorId: true },
      orderBy: { createdAt: 'asc' },
    })
    if (members.length === 0) break

    for (const m of members) {
      map.set(m.id, { ...m, level, children: [] })
      total++
      if (m.isActive) active++
    }
    levelIds = members.map(m => m.id)
  }

  // Wire up parent → children
  const roots: Raw[] = []
  for (const node of Array.from(map.values())) {
    if (node.sponsorId === rootId) {
      roots.push(node)
    } else if (node.sponsorId && map.has(node.sponsorId)) {
      map.get(node.sponsorId)!.children.push(node)
    }
  }

  function toTree(n: Raw): TreeNode {
    return {
      id: n.id,
      username: n.username,
      fullName: n.fullName,
      isActive: n.isActive,
      plan: n.plan,
      level: n.level,
      directCount: n.children.length,
      children: n.children.map(toTree),
    }
  }

  return { tree: roots.map(toTree), total, active }
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const [{ tree, total, active }, commissionsAgg, recentBonuses] = await Promise.all([
      buildTree(user.id),
      prisma.commission.aggregate({ where: { userId: user.id }, _sum: { amount: true } }),
      prisma.commission.findMany({
        where: { userId: user.id, type: 'SPONSORSHIP_BONUS' },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      referralCode: user.referralCode,
      user: { fullName: user.fullName, username: user.username, isActive: user.isActive },
      tree,
      stats: {
        directReferrals: tree.length,
        totalNetwork: total,
        totalActive: active,
        totalCommissions: Number(commissionsAgg._sum.amount ?? 0),
        pendingBalance: 0,
      },
      recentBonuses: recentBonuses.map(b => ({
        id: b.id,
        amount: Number(b.amount),
        description: b.description,
        createdAt: b.createdAt,
      })),
    })
  } catch (err) {
    console.error('[GET /api/network]', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
