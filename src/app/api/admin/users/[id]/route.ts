import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser, unauthorizedAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const admin = await getAdminUser()
  if (!admin) return unauthorizedAdmin()

  const body = await request.json()
  const { plan, isActive, isAdmin: makeAdmin } = body

  // Use raw SQL for plan/isAdmin/isActive to bypass stale Prisma client
  if (plan !== undefined) {
    await prisma.$executeRaw`
      UPDATE users SET plan = ${plan}::"UserPlan" WHERE id = ${params.id}::uuid
    `
  }
  if (isActive !== undefined) {
    await prisma.$executeRaw`
      UPDATE users SET is_active = ${isActive} WHERE id = ${params.id}::uuid
    `
  }
  if (makeAdmin !== undefined) {
    await prisma.$executeRaw`
      UPDATE users SET is_admin = ${makeAdmin} WHERE id = ${params.id}::uuid
    `
  }

  // Return updated user via raw SQL
  const rows = await prisma.$queryRaw<Array<{
    id: string; username: string; full_name: string; plan: string; is_active: boolean; is_admin: boolean
  }>>`
    SELECT id, username, full_name, plan::text, is_active, is_admin
    FROM users WHERE id = ${params.id}::uuid LIMIT 1
  `
  const row = rows[0]
  if (!row) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

  return NextResponse.json({
    success: true,
    user: {
      id: row.id,
      username: row.username,
      fullName: row.full_name,
      plan: row.plan,
      isActive: row.is_active,
      isAdmin: row.is_admin,
    },
  })
}
