'use client'

import { useEffect, useState, useCallback } from 'react'
import {
  Search,
  Users,
  Crown,
  Shield,
  ShieldOff,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface UserRow {
  id: string
  username: string
  fullName: string
  email: string
  country: string
  plan: string
  isActive: boolean
  isAdmin: boolean
  createdAt: string
  totalCommissions: number
  _count: { referrals: number }
}

const PLAN_BADGE: Record<string, string> = {
  NONE: 'text-white/30 bg-white/5 border-white/10',
  BASIC: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
  PRO: 'text-purple-400 bg-purple-500/10 border-purple-500/25',
  ELITE: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/25',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (search) params.set('q', search)
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotalPages(data.pages ?? 1)
    setTotal(data.total ?? 0)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  async function updateUser(id: string, patch: Record<string, unknown>) {
    setUpdating(id)
    await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
    await fetchUsers()
    setUpdating(null)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
            <Users size={18} className="text-cyan-400" /> Usuarios
          </h1>
          <p className="text-xs text-white/30 mt-0.5">{total} usuarios registrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
        <input
          type="text"
          placeholder="Buscar por nombre, usuario o email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-white/[0.025] border border-white/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="animate-spin text-purple-400" size={22} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xs text-white/20">No se encontraron usuarios</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">Usuario</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">Plan</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 hidden md:table-cell">Red</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30 hidden md:table-cell">Comisiones</th>
                  <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">Estado</th>
                  <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white/30">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/20 flex items-center justify-center text-[11px] font-black text-purple-400 shrink-0">
                          {u.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-bold truncate max-w-[120px]">{u.fullName}</p>
                            {u.isAdmin && <Crown size={10} className="text-yellow-400 shrink-0" />}
                          </div>
                          <p className="text-[10px] text-white/30 truncate max-w-[120px]">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${PLAN_BADGE[u.plan] ?? PLAN_BADGE.NONE}`}>
                        {u.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-white/50">{u._count.referrals} refs</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs font-bold text-yellow-400">${u.totalCommissions.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${u.isActive ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {updating === u.id ? (
                          <Loader2 size={14} className="animate-spin text-white/40" />
                        ) : (
                          <>
                            <button
                              onClick={() => updateUser(u.id, { isActive: !u.isActive })}
                              title={u.isActive ? 'Desactivar' : 'Activar'}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {u.isActive
                                ? <UserX size={13} className="text-red-400" />
                                : <UserCheck size={13} className="text-green-400" />
                              }
                            </button>
                            <button
                              onClick={() => updateUser(u.id, { isAdmin: !u.isAdmin })}
                              title={u.isAdmin ? 'Quitar admin' : 'Hacer admin'}
                              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                              {u.isAdmin
                                ? <ShieldOff size={13} className="text-yellow-400" />
                                : <Shield size={13} className="text-white/30" />
                              }
                            </button>
                            <select
                              value={u.plan}
                              onChange={e => updateUser(u.id, { plan: e.target.value })}
                              className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-1.5 py-1 text-white/60 outline-none cursor-pointer hover:border-white/20"
                            >
                              <option value="NONE">NONE</option>
                              <option value="BASIC">BASIC</option>
                              <option value="PRO">PRO</option>
                              <option value="ELITE">ELITE</option>
                            </select>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-white/40">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
