'use client'
// src/app/admin/campaigns/campaigns-client.tsx

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, Megaphone, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import CampaignModal from './campaign-modal'

interface Campaign {
  id: string; name: string; description: string | null
  startDate: string; endDate: string; active: boolean; createdAt: string
  company: { name: string }; _count: { promotions: number }
}

export default function CampaignsClient() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; campaign?: Campaign }>({ open: false })

  async function fetchCampaigns() {
    setLoading(true)
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data)
    setLoading(false)
  }

  useEffect(() => { fetchCampaigns() }, [])

  async function deleteCampaign(id: string) {
    if (!confirm('Excluir esta campanha e todas as promoções vinculadas?')) return
    await fetch(`/api/campaigns/${id}`, { method: 'DELETE' })
    fetchCampaigns()
  }

  function isActive(c: Campaign) {
    const now = new Date()
    return c.active && new Date(c.startDate) <= now && new Date(c.endDate) >= now
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{campaigns.length} campanhas</p>
        <button
          onClick={() => setModal({ open: true })}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition"
        >
          <Plus className="w-4 h-4" /> Nova Campanha
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
      ) : campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Megaphone className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma campanha cadastrada.</p>
          <button onClick={() => setModal({ open: true })} className="mt-3 text-orange-500 text-sm font-medium hover:underline">
            Criar primeira campanha
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isActive(c) ? 'bg-green-100' : 'bg-gray-100'}`}>
                <Megaphone className={`w-5 h-5 ${isActive(c) ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 text-sm">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${isActive(c) ? 'bg-green-100 text-green-700' : c.active ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                    {isActive(c) ? 'Ativa' : c.active ? 'Fora do período' : 'Inativa'}
                  </span>
                </div>
                {c.description && <p className="text-gray-500 text-xs mt-1 truncate">{c.description}</p>}
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(c.startDate), 'dd/MM/yy')} — {format(new Date(c.endDate), 'dd/MM/yy')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Tag className="w-3 h-3" /> {c._count.promotions} promoções
                  </span>
                  <span className="text-xs text-gray-400">{c.company.name}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => setModal({ open: true, campaign: c })}
                  className="w-8 h-8 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 flex items-center justify-center transition">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => deleteCampaign(c.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 flex items-center justify-center transition">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <CampaignModal
          campaign={modal.campaign}
          onClose={() => setModal({ open: false })}
          onSaved={() => { setModal({ open: false }); fetchCampaigns() }}
        />
      )}
    </div>
  )
}
