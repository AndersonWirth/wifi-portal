'use client'
// src/app/admin/companies/company-modal.tsx

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { generateSlug } from '@/lib/utils'

interface Props {
  company?: any
  onClose: () => void
  onSaved: () => void
}

export default function CompanyModal({ company, onClose, onSaved }: Props) {
  const isEdit = !!company
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: company?.name || '',
    slug: company?.slug || '',
    primaryColor: company?.primaryColor || '#FF6B35',
    secondaryColor: company?.secondaryColor || '#1A1A2E',
    accentColor: company?.accentColor || '#FF9500',
    pageTitle: company?.pageTitle || 'Wi-Fi Gratuito',
    welcomeText: company?.welcomeText || 'Conecte-se gratuitamente!',
    footerText: company?.footerText || 'Ao conectar, você concorda com nossos termos.',
    postLoginRedirectUrl: company?.postLoginRedirectUrl || '',
    lgpdEnabled: company?.lgpdEnabled ?? false,
    lgpdText: company?.lgpdText || '',
    active: company?.active ?? true,
  })

  function setField(field: string, value: any) { setForm(f => ({ ...f, [field]: value })) }

  function handleNameChange(name: string) {
    setField('name', name)
    if (!isEdit) setField('slug', generateSlug(name))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const body = { ...form, postLoginRedirectUrl: form.postLoginRedirectUrl || null, lgpdText: form.lgpdText || null }
    const res = await fetch(isEdit ? `/api/companies/${company.id}` : '/api/companies', {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (res.ok) { onSaved() } else {
      const d = await res.json(); setError(d.error || 'Erro ao salvar.')
    }
    setLoading(false)
  }

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-semibold text-gray-900">{isEdit ? 'Editar Empresa' : 'Nova Empresa'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
              <input value={form.name} onChange={e => handleNameChange(e.target.value)} required className={inputCls} placeholder="Mercado Bom Preço" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Slug (URL) *</label>
              <input value={form.slug} onChange={e => setField('slug', e.target.value)} required className={`${inputCls} font-mono`} placeholder="mercado-bom-preco" />
              <p className="text-xs text-gray-400 mt-1">Portal: /portal/{form.slug || 'slug'}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Texto de boas-vindas</label>
            <input value={form.welcomeText} onChange={e => setField('welcomeText', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">URL pós-conexão</label>
            <input type="url" value={form.postLoginRedirectUrl} onChange={e => setField('postLoginRedirectUrl', e.target.value)} className={inputCls} placeholder="https://..." />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[['Cor primária', 'primaryColor'], ['Cor secundária', 'secondaryColor'], ['Destaque', 'accentColor']].map(([label, field]) => (
              <div key={field}>
                <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                <div className="flex gap-1.5 items-center">
                  <input type="color" value={(form as any)[field]} onChange={e => setField(field, e.target.value)}
                    className="w-9 h-9 rounded-lg border border-gray-200 cursor-pointer p-0.5 shrink-0" />
                  <input value={(form as any)[field]} onChange={e => setField(field, e.target.value)}
                    className="flex-1 border border-gray-200 rounded-lg px-2 py-2 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-orange-500 min-w-0" />
                </div>
              </div>
            ))}
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.lgpdEnabled} onChange={e => setField('lgpdEnabled', e.target.checked)} className="rounded" style={{ accentColor: '#f97316' }} />
            <span className="text-sm text-gray-700">Exigir aceite LGPD</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setField('active', e.target.checked)} className="rounded" style={{ accentColor: '#f97316' }} />
            <span className="text-sm text-gray-700">Empresa ativa</span>
          </label>

          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition">Cancelar</button>
            <button type="submit" disabled={loading} className="flex-1 py-2.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</> : isEdit ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
