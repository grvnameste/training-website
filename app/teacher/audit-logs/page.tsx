'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ScrollText } from 'lucide-react'

type AuditLog = {
  id: string
  action: string
  resourceType: string
  resourceId: string
  metadata: Record<string, unknown> | null
  ip: string | null
  userAgent: string | null
  createdAt: string
  actorProfileId: string | null
  actorName: string | null
  actorEmail: string | null
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(25)
  const [action, setAction] = useState('')
  const [resourceType, setResourceType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      })
      if (action.trim()) params.set('action', action.trim())
      if (resourceType.trim()) params.set('resourceType', resourceType.trim())

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`, {
        cache: 'no-store',
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 403) {
        setError('Super admin access is required to view audit logs.')
        return
      }
      if (!res.ok) throw new Error(data?.error || 'Could not load audit logs')
      setLogs(data.logs ?? [])
      setTotal(data.total ?? 0)
    } catch (err: any) {
      setError(err?.message || 'Could not load audit logs')
    } finally {
      setLoading(false)
    }
  }, [action, page, pageSize, resourceType])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-16">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-slate-900">
          <ScrollText className="h-5 w-5 text-blue-600" />
          Audit Logs
        </h1>
        <p className="text-sm text-slate-500">
          Immutable record of authentication, course, assignment, project, and
          certificate activity.
        </p>
      </div>

      <Card className="rounded-2xl border border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Action contains
            </label>
            <Input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="e.g. certificate or project.template"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Resource type
            </label>
            <Input
              value={resourceType}
              onChange={(event) => setResourceType(event.target.value)}
              placeholder="e.g. assignment"
            />
          </div>
          <Button
            onClick={() => {
              setPage(1)
              void load()
            }}
          >
            Apply
          </Button>
        </CardContent>
      </Card>

      {error ? (
        <Card className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </Card>
      ) : (
        <Card className="rounded-2xl border border-slate-200 bg-white">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <p className="px-6 py-16 text-center text-sm text-slate-500">
                No audit events match these filters.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Time</th>
                      <th className="px-4 py-3 font-semibold">Action</th>
                      <th className="px-4 py-3 font-semibold">Resource</th>
                      <th className="px-4 py-3 font-semibold">Actor</th>
                      <th className="px-4 py-3 font-semibold">IP</th>
                      <th className="px-4 py-3 font-semibold">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-slate-100 align-top">
                        <td className="whitespace-nowrap px-4 py-3 text-slate-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {log.action}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          <span className="font-medium">{log.resourceType}</span>
                          <span className="block max-w-[220px] truncate text-[11px] text-slate-400">
                            {log.resourceId}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {log.actorName || log.actorEmail || 'System'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{log.ip || '—'}</td>
                        <td className="px-4 py-3">
                          <code className="block max-w-[300px] overflow-hidden text-ellipsis whitespace-nowrap text-[11px] text-slate-500">
                            {log.metadata ? JSON.stringify(log.metadata) : '—'}
                          </code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          {total} event{total === 1 ? '' : 's'} · page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || loading}
            onClick={() => setPage((value) => value + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
