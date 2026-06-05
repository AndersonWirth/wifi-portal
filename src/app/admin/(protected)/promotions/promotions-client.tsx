'use client'
// src/app/admin/promotions/promotions-client.tsx

import { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, Upload, X, Tag, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface PromotionImage { id: string; url: string; altText: string | null; sortOrder: number }
interface Promotion {
  id: string; title: string; description: string | null
  sortOrder: number; active: boolean; images: PromotionImage[]
  campaign: { id: string; name: string; company: { name: string } }
}

export default function PromotionsClient() {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const [currentPromoId, setCurrentPromoId] = useState<string | null>(null)

  async function fetchCampaigns() {
    const res = await fetch('/api/campaigns')
    const data = await res.json()
    setCampaigns(data)
    if (data.length > 0 && !selectedCampaign) setSelectedCampaign(data[0].id)
  }

  async function fetchPromotions(campaignId: string) {
    if (!campaignId) return
    setLoading(true)
    const res = await fetch(`/api/promotions?campaignId=${campaignId}`)
    const data = await res.json()
    setPromotions(data)
    setLoading(false)
  }

  useEffect(() => { fetchCampaigns() }, [])
  useEffect(() => { if (selectedCampaign) fetchPromotions(selectedCampaign) }, [selectedCampaign])

  async function createPromotion() {
    const title = prompt('Título da promoção:')
    if (!title) return
    await fetch('/api/promotions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, campaignId: selectedCampaign, sortOrder: promotions.length, active: true }),
    })
    fetchPromotions(selectedCampaign)
  }

  async function deletePromotion(id: string) {
    if (!confirm('Excluir esta promoção?')) return
    await fetch(`/api/promotions/${id}`, { method: 'DELETE' })
    fetchPromotions(selectedCampaign)
  }

  async function toggleActive(promo: Promotion) {
    await fetch(`/api/promotions/${promo.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !promo.active }),
    })
    fetchPromotions(selectedCampaign)
  }

  function triggerUpload(promoId: string) {
    setCurrentPromoId(promoId)
    fileRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentPromoId) return
    setUploading(currentPromoId)

    const formData = new FormData()
    formData.append('file', file)

    await fetch(`/api/promotions/${currentPromoId}/images`, { method: 'POST', body: formData })
    fetchPromotions(selectedCampaign)
    setUploading(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deleteImage(promoId: string, imageId: string) {
    if (!confirm('Remover esta imagem?')) return
    await fetch(`/api/promotions/${promoId}/images`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
    })
    fetchPromotions(selectedCampaign)
  }

  return (
    <div className="space-y-5">
      {/* Campaign selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 flex-wrap">
        <label className="text-sm font-medium text-gray-700">Campanha:</label>
        <select
          value={selectedCampaign}
          onChange={e => setSelectedCampaign(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 min-w-48"
        >
          <option value="">Selecione...</option>
          {campaigns.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.company?.name}</option>
          ))}
        </select>
        {selectedCampaign && (
          <button onClick={createPromotion}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition">
            <Plus className="w-4 h-4" /> Nova Promoção
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Promotions list */}
      {loading ? (
        <div className="text-center py-16 text-gray-400 text-sm">Carregando...</div>
      ) : promotions.length === 0 && selectedCampaign ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Tag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400">Nenhuma promoção nesta campanha.</p>
          <button onClick={createPromotion} className="mt-3 text-orange-500 text-sm font-medium hover:underline">
            Criar primeira promoção
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              {/* Promo header */}
              <div className="p-4 flex items-center gap-3">
                <button
                  onClick={() => setExpandedId(expandedId === promo.id ? null : promo.id)}
                  className="flex items-center gap-3 flex-1 min-w-0 text-left"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${promo.active ? 'bg-green-400' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{promo.title}</p>
                    <p className="text-xs text-gray-400">{promo.images.length} {promo.images.length === 1 ? 'imagem' : 'imagens'}</p>
                  </div>
                </button>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => triggerUpload(promo.id)}
                    disabled={uploading === promo.id}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition disabled:opacity-50">
                    {uploading === promo.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Imagem
                  </button>
                  <button onClick={() => toggleActive(promo)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition ${promo.active ? 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}>
                    {promo.active ? 'Ativa' : 'Inativa'}
                  </button>
                  <button onClick={() => deletePromotion(promo.id)}
                    className="w-7 h-7 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 flex items-center justify-center transition">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Images */}
              {expandedId === promo.id && (
                <div className="px-4 pb-4 border-t border-gray-50">
                  {promo.images.length === 0 ? (
                    <div className="text-center py-6 text-gray-400 text-sm">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                      Nenhuma imagem. Clique em "Imagem" para fazer upload.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 pt-3">
                      {promo.images.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <Image src={img.url} alt={img.altText || promo.title} fill className="object-cover" sizes="120px" />
                          <button
                            onClick={() => deleteImage(promo.id, img.id)}
                            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full items-center justify-center hidden group-hover:flex transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
