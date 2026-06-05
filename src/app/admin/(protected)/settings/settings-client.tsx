'use client'
// src/app/admin/settings/settings-client.tsx

import { useState, useEffect } from 'react'
import { Save, Loader2, Eye } from 'lucide-react'
import LogoUpload from '@/components/admin/logo-upload'

interface Company {
  id: string; name: string; slug: string; logoUrl: string | null; faviconUrl: string | null
  primaryColor: string; secondaryColor: string; accentColor: string
  pageTitle: string; welcomeText: string; footerText: string
  postLoginRedirectUrl: string | null; lgpdEnabled: boolean; lgpdText: string | null
  active: boolean; customDomain: string | null
}

export default function SettingsClient() {
  const [company, setCompany] = useState<Company | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<Partial<Company>>({})

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/companies')
      const data = await res.json()
      if (data.length > 0) {
        setCompany(data[0])
        setForm(data[0])
      }
      setLoading(false)
    }
    load()
  }, [])

  function setField(field: string, value: any) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!company) return
    setSaving(true)
    await fetch(`/api/companies/${company.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (loading) return <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
  if (!company) return <div className="text-center py-16 text-gray-400 text-sm">Nenhuma empresa encontrada.</div>

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  )

  const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
  const textareaCls = `${inputCls} resize-none`

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      {/* Portal link */}
      <div className="bg-orange-50 border border-orange-100 rounded-2xl px-4 py-3 flex items-center gap-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-orange-800">URL do Portal do Cliente</p>
          <p className="text-xs text-orange-600 mt-0.5 font-mono">
            {process.env.NEXT_PUBLIC_APP_URL || 'https://seu-app.vercel.app'}/portal/{company.slug}
          </p>
        </div>
        <a
          href={`/portal/${company.slug}`}
          target="_blank"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-medium hover:bg-orange-600 transition"
        >
          <Eye className="w-3 h-3" /> Ver portal
        </a>
      </div>

      {/* Section: Logo & Favicon */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Logo & Favicon</h2>
        <LogoUpload
          companyId={company.id}
          currentUrl={company.logoUrl}
          type="logo"
          label="Logo da empresa"
          onUploaded={(url) => setField('logoUrl', url)}
        />
        <LogoUpload
          companyId={company.id}
          currentUrl={company.faviconUrl}
          type="favicon"
          label="Favicon (ícone da aba)"
          onUploaded={(url) => setField('faviconUrl', url)}
        />
      </div>

      {/* Section: Identidade */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Identidade</h2>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome da empresa">
            <input value={form.name || ''} onChange={e => setField('name', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Slug (URL)">
            <input value={form.slug || ''} onChange={e => setField('slug', e.target.value)} className={inputCls} />
          </Field>
        </div>
        <Field label="Título da página (SEO)">
          <input value={form.pageTitle || ''} onChange={e => setField('pageTitle', e.target.value)} className={inputCls} />
        </Field>
        <Field label="Texto de boas-vindas">
          <textarea rows={2} value={form.welcomeText || ''} onChange={e => setField('welcomeText', e.target.value)} className={textareaCls} />
        </Field>
        <Field label="Rodapé">
          <textarea rows={2} value={form.footerText || ''} onChange={e => setField('footerText', e.target.value)} className={textareaCls} />
        </Field>
      </div>

      {/* Section: Cores */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Cores</h2>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cor primária', field: 'primaryColor' },
            { label: 'Cor secundária', field: 'secondaryColor' },
            { label: 'Cor de destaque', field: 'accentColor' },
          ].map(({ label, field }) => (
            <Field key={field} label={label}>
              <div className="flex gap-2 items-center">
                <input type="color" value={(form as any)[field] || '#000000'} onChange={e => setField(field, e.target.value)}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer p-1" />
                <input value={(form as any)[field] || ''} onChange={e => setField(field, e.target.value)}
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </Field>
          ))}
        </div>
      </div>

      {/* Section: Conexão */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">Redirecionamento</h2>
        <Field label="URL após conexão (promoções, Instagram, WhatsApp...)">
          <input
            type="url"
            value={form.postLoginRedirectUrl || ''}
            onChange={e => setField('postLoginRedirectUrl', e.target.value)}
            placeholder="https://empresa.com.br/promocoes"
            className={inputCls}
          />
        </Field>
        <p className="text-xs text-gray-400">Deixe em branco para usar a página de promoções interna.</p>
      </div>

      {/* Section: LGPD */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide text-gray-500">LGPD</h2>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.lgpdEnabled ?? false} onChange={e => setField('lgpdEnabled', e.target.checked)}
            className="rounded" style={{ accentColor: '#f97316' }} />
          <span className="text-sm text-gray-700">Exigir aceite da Política de Privacidade</span>
        </label>
        {form.lgpdEnabled && (
          <Field label="Texto do checkbox LGPD">
            <textarea rows={2} value={form.lgpdText || ''} onChange={e => setField('lgpdText', e.target.value)} className={textareaCls}
              placeholder="Concordo com a Política de Privacidade..." />
          </Field>
        )}
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button type="submit" disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 disabled:opacity-50 transition">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</> : <><Save className="w-4 h-4" /> Salvar configurações</>}
        </button>
        {saved && <span className="text-green-600 text-sm font-medium">✓ Salvo com sucesso!</span>}
      </div>
    </form>
  )
}
