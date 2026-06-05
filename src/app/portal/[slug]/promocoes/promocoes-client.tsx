'use client'
// src/app/portal/[slug]/promocoes/promocoes-client.tsx

import { useState, useRef } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Wifi, Tag } from 'lucide-react'
import type { CampaignWithPromotions } from '@/types'

interface Company {
  id: string; name: string; slug: string; logoUrl: string | null
  primaryColor: string; secondaryColor: string; accentColor: string
}

interface Props {
  company: Company
  campaigns: CampaignWithPromotions[]
}

function ImageSlider({ images, primaryColor }: { images: { url: string; altText?: string | null }[]; primaryColor: string }) {
  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const touchStartX = useRef<number>(0)

  if (images.length === 0) return null

  function prev() { setCurrent(i => (i === 0 ? images.length - 1 : i - 1)) }
  function next() { setCurrent(i => (i === images.length - 1 ? 0 : i + 1)) }

  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (diff > 50) next()
    else if (diff < -50) prev()
  }

  return (
    <>
      <div
        className="relative rounded-xl overflow-hidden bg-gray-100 select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="aspect-[4/3] relative">
          <Image
            src={images[current].url}
            alt={images[current].altText || 'Promoção'}
            fill
            className="object-cover cursor-zoom-in"
            sizes="(max-width: 640px) 100vw, 600px"
            onClick={() => setLightbox(current)}
            loading="lazy"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 flex items-center justify-center text-white hover:bg-black/60 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{ background: i === current ? primaryColor : 'rgba(255,255,255,0.5)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20">
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-2xl w-full max-h-[90vh]">
            <Image
              src={images[lightbox].url}
              alt={images[lightbox].altText || 'Promoção'}
              width={800}
              height={600}
              className="object-contain w-full h-full rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          {images.length > 1 && (
            <div className="absolute bottom-6 flex gap-2">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setLightbox(i) }}
                  className="w-2 h-2 rounded-full transition-all"
                  style={{ background: i === lightbox ? primaryColor : 'rgba(255,255,255,0.4)' }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default function PromocoesClient({ company, campaigns }: Props) {
  const primary = company.primaryColor || '#FF6B35'
  const secondary = company.secondaryColor || '#1A1A2E'

  return (
    <div className="min-h-screen" style={{ background: secondary }}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-white/10" style={{ background: secondary }}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          {company.logoUrl ? (
            <Image src={company.logoUrl} alt={company.name} width={36} height={36} className="rounded-lg object-contain" />
          ) : (
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: primary }}>
              <Wifi className="w-5 h-5 text-white" />
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm leading-none">{company.name}</p>
            <p className="text-white/50 text-xs mt-0.5">Promoções de hoje</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-white" style={{ background: primary }}>
            <Wifi className="w-3 h-3" />
            Conectado
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-8 pb-16">
        {campaigns.length === 0 ? (
          <div className="text-center py-20">
            <Tag className="w-12 h-12 text-white/20 mx-auto mb-3" />
            <p className="text-white/40">Nenhuma promoção ativa no momento.</p>
            <p className="text-white/30 text-sm mt-1">Volte em breve!</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id}>
              {/* Campaign header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1 bg-white/10" />
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: primary }}
                >
                  {campaign.name}
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Promotions */}
              <div className="space-y-4">
                {campaign.promotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="rounded-2xl overflow-hidden border border-white/8"
                    style={{ background: 'rgba(255,255,255,0.05)' }}
                  >
                    {promo.images.length > 0 && (
                      <ImageSlider images={promo.images} primaryColor={primary} />
                    )}
                    {(promo.title || promo.description) && (
                      <div className="px-4 py-3">
                        <h3 className="text-white font-semibold text-sm">{promo.title}</h3>
                        {promo.description && (
                          <p className="text-white/60 text-xs mt-1 leading-relaxed">{promo.description}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
