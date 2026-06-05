'use client'
// src/app/admin/leads/leads-client.tsx

import { useState, useEffect, useCallback } from 'react'
import { Search, Download, RefreshCw, Phone, User, Calendar, Wifi } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface Lead {
  id: string; name: string; phone: string; ipAddress: string | null
  macAddress: string | null; lgpdAccepted: boolean; createdAt: string
  company: { name: string; slug: string }
}

export default function LeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), limit: '20' })
    if (search) params.set('search', search)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)

    const res = await fetch(`/api/leads?${params}`)
    const data = await res.json()
    setLeads(data.leads || [])
    setTotal(data.total || 0)
    setPages(data.pages || 1)
    setLoading(false)
  }, [page, search, fromDate, toDate])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  async function exportLeads(format: 'csv' | 'xlsx') {
    const params = new URLSearchParams({ format })
    if (search) params.set('search', search)
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    window.open(`/api/leads?${params}`, '_blank')
  }

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
        <input
          type="date" value={fromDate}
          onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <input
          type="date" value={toDate}
          onChange={(e) => { setToDate(e.target.value); setPage(1) }}
          className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button onClick={() => exportLeads('csv')}
          className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition">
          <Download className="w-4 h-4" /> CSV
        </button>
        <button onClick={() => exportLeads('xlsx')}
          className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50 transition">
          <Download className="w-4 h-4" /> Excel
        </button>
        <button onClick={fetchLeads}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-orange-500 text-white rounded-xl text-sm hover:bg-orange-600 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary */}
      <p className="text-sm text-gray-500">
        {total.toLocaleString('pt-BR')} leads encontrados
      </p>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Telefone</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Empresa</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">IP / MAC</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">LGPD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Carregando...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">Nenhum lead encontrado.</td></tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-orange-600 text-xs font-semibold">{lead.name[0].toUpperCase()}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-32">{lead.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm text-gray-700 font-mono">
                      {lead.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-sm text-gray-600">{lead.company.name}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <div className="text-xs text-gray-400 font-mono space-y-0.5">
                      <div>{lead.ipAddress || '—'}</div>
                      <div>{lead.macAddress || '—'}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs text-gray-500">
                      {format(new Date(lead.createdAt), "dd/MM/yy HH:mm", { locale: ptBR })}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${lead.lgpdAccepted ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {lead.lgpdAccepted ? 'Sim' : 'Não'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              Anterior
            </button>
            <span className="text-sm text-gray-500">Página {page} de {pages}</span>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition">
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
