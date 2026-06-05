'use client'
// src/app/admin/campaigns/campaign-modal.tsx

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Campaign {
  id: string; name: string; description: string | null
  startDate: string; endDate: string; active: boolean
}

interface Props {
  campaign?: Campaign
  onClose: () => void
  onSaved: () => void
}

export default function CampaignModal({ campaign, onClose, onSaved }: Props) {
  const isEdit = !!campaign
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    startDate: campaign ? format(new Date(campaign.startDate), "yyyy-MM-dd'T'HH:mm") : '',
    endDate: campaign ? format(new Date(campaign.endDate), "yyyy-MM-dd'T'HH:mm") : '',
    active: campaign?.active ?? true,
  })

  function setField(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.startDate || !form.endDate) {
      setError('Preencha todos os campos obrigatórios.'); return
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError('A data de início deve ser anterior à data de término.'); return
    }

    setLoading(true); setError('')

    const body = {
      name: form.name,
      description: form.description || null,
      startDate: new Date(form.startDate).toISOString(),
      endDate: new Date(form.endDate).toISOString(),
      active: form.active,
    }

    const url = isEdit ? `/api/campaigns/${campaign!.id}` : '/api/campaigns'
    const method = isEdit ? 'PUT' : 'POST'

    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })

    if (res.ok) {
      onSaved()
    } else {
      const d = await res.json()
      setError(d.error || 'Erro ao salvar.')
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Editar Campanha' : 'Nova Campanha'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
            <input value={form.name} onChange={e => setField('name', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ex: Black Friday, Natal..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descrição</label>
            <textarea value={form.description} onChange={e => setField('description', e.target.value)}
              rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              placeholder="Descrição opcional..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Início *</label>
              <input type="datetime-local" value={form.startDate} onChange={e => setField('startDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Término *</label>
              <input type="datetime-local" value={form.endDate} onChange={e => setField('endDate', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setField('active', e.target.checked)}
              className="rounded" style={{ accentColor: '#f97316' }} />
            <span className="text-sm text-gray-700">Campanha ativa</span>
          </label>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
