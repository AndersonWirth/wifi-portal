'use client'
// src/components/admin/logo-upload.tsx

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'

interface Props {
  companyId: string
  currentUrl?: string | null
  type: 'logo' | 'favicon'
  label: string
  onUploaded?: (url: string) => void
}

export default function LogoUpload({ companyId, currentUrl, type, label, onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('Máximo 5MB'); return
    }

    setLoading(true); setError('')

    // Local preview
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    const res = await fetch(`/api/companies/${companyId}/upload`, {
      method: 'POST', body: formData,
    })

    if (res.ok) {
      const { url } = await res.json()
      setPreview(url)
      onUploaded?.(url)
    } else {
      const d = await res.json()
      setError(d.error || 'Erro no upload')
    }
    setLoading(false)
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      <div className="flex items-center gap-3">
        {/* Preview */}
        <div className={`relative bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 ${type === 'logo' ? 'w-16 h-16' : 'w-10 h-10'}`}>
          {loading ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : preview ? (
            <Image src={preview} alt={label} fill className="object-contain p-1" />
          ) : (
            <Upload className="w-5 h-5 text-gray-300" />
          )}
        </div>

        {/* Actions */}
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            {preview ? 'Trocar' : 'Enviar'} {type === 'logo' ? 'logo' : 'favicon'}
          </button>
          {preview && (
            <button
              type="button"
              onClick={() => setPreview(null)}
              className="flex items-center gap-1 px-3 py-1 text-xs text-red-400 hover:text-red-600 transition"
            >
              <X className="w-3 h-3" /> Remover
            </button>
          )}
          <p className="text-xs text-gray-400">PNG, JPG ou SVG. Máx 5MB.</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/svg+xml,image/webp,image/x-icon"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  )
}
