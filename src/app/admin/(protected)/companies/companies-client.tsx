'use client'
// src/app/admin/companies/companies-client.tsx

import { useState, useEffect } from 'react'
import { Plus, Building2, Users, Megaphone, ExternalLink, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
import Link from 'next/link'
import CompanyModal from './company-modal'

interface Company {
  id: string; name: string; slug: string; active: boolean; createdAt: string
  primaryColor: string; postLoginRedirectUrl: string | null
  _count: { leads: number; campaigns: number }
}

export default function CompaniesClient() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; company?: Company }>({ open: false })

  async function fetchCompanies() {
    setLoading(true)
    const res = await fetch('/api/companies')
    setCompanies(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchCompanies() }, [])

  async function toggleActive(c: Company) {
    await fetch(`/api/companies/${c.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    })
    fetchCompanies()
  }

  async function deleteCompany(id: string) {
    if (!confirm('Excluir empresa e todos os dados vinculados?')) return
    await fetch(`/api/companies/${id}`, { method: 'DELETE' })
    fetchCompanies()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{companies.length} empresas</p>
        <button onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
          <Plus className="w-4 h-4" /> Nova Empresa
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.primaryColor }}>
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                    <p className="text-gray-400 text-xs font-mono">/{c.slug}</p>
                  </div>
                </div>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.active ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="flex gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />{c._count.leads} leads</span>
                <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" />{c._count.campaigns} campanhas</span>
              </div>

              <div className="flex items-center gap-1 pt-1 border-t border-gray-50">
                <a href={`/portal/${c.slug}`} target="_blank"
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition">
                  <ExternalLink className="w-3 h-3" /> Portal
                </a>
                <button onClick={() => setModal({ open: true, company: c })}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition">
                  <Pencil className="w-3 h-3" /> Editar
                </button>
                <button onClick={() => toggleActive(c)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition ml-auto">
                  {c.active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                  {c.active ? 'Desativar' : 'Ativar'}
                </button>
                <button onClick={() => deleteCompany(c.id)}
                  className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <CompanyModal
          company={modal.company}
          onClose={() => setModal({ open: false })}
          onSaved={() => { setModal({ open: false }); fetchCompanies() }}
        />
      )}
    </div>
  )
}
