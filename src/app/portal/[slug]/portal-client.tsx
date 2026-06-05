'use client'
// src/app/portal/[slug]/portal-client.tsx

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Image from 'next/image'
import { Wifi, Loader2, Shield, CheckCircle } from 'lucide-react'
import { formatPhone } from '@/lib/utils'
import type { PortalCompany } from '@/types'

const formSchema = z.object({
  name: z.string().min(2, 'Informe seu nome completo'),
  phone: z.string().min(10, 'Telefone inválido').max(20),
  lgpdAccepted: z.boolean().optional(),
})

type FormData = z.infer<typeof formSchema>

interface Props {
  company: PortalCompany
  mikrotik: {
    mac?: string
    ip?: string
    linkLogin?: string
    linkLoginOnly?: string
    linkOrig?: string
  }
}

export default function PortalClient({ company, mikrotik }: Props) {
  const [loading, setLoading] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { lgpdAccepted: false },
  })

  const lgpdAccepted = watch('lgpdAccepted')

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatPhone(e.target.value)
    setValue('phone', formatted)
  }

  async function onSubmit(data: FormData) {
    if (company.lgpdEnabled && !data.lgpdAccepted) {
      setError('Você precisa aceitar a Política de Privacidade para continuar.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/portal/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          companyId: company.id,
          mac: mikrotik.mac,
          ip: mikrotik.ip,
          linkLoginOnly: mikrotik.linkLoginOnly,
          lgpdAccepted: data.lgpdAccepted ?? false,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Erro ao conectar. Tente novamente.')
        return
      }

      setConnected(true)

      // 1) Login no MikroTik via link-login-only (iframe oculto ou redirect)
      if (mikrotik.linkLoginOnly) {
        // Monta URL de login com credencial guest
        const loginUrl = new URL(mikrotik.linkLoginOnly)
        loginUrl.searchParams.set('username', 'guest')
        loginUrl.searchParams.set('password', '')

        // Abre em iframe invisível para não sair da página de redirect
        const iframe = document.createElement('iframe')
        iframe.src = loginUrl.toString()
        iframe.style.display = 'none'
        document.body.appendChild(iframe)
      }

      // 2) Redireciona para página de promoções após 1.5s
      setTimeout(() => {
        const redirectUrl =
          company.postLoginRedirectUrl ||
          `${window.location.origin}/portal/${company.slug}/promocoes`
        window.location.href = redirectUrl
      }, 1500)
    } catch {
      setError('Erro de conexão. Verifique sua rede e tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const primaryColor = company.primaryColor || '#FF6B35'
  const secondaryColor = company.secondaryColor || '#1A1A2E'

  if (connected) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ background: secondaryColor }}
      >
        <div className="text-center space-y-4 animate-in fade-in duration-500">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: primaryColor }}
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Conectado!</h2>
          <p className="text-white/60">Redirecionando para as promoções...</p>
          <Loader2 className="w-6 h-6 text-white/40 animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: secondaryColor }}
    >
      <div className="w-full max-w-sm">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div
            className="px-6 py-8 flex flex-col items-center text-center gap-3"
            style={{ background: primaryColor }}
          >
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                width={72}
                height={72}
                className="rounded-xl object-contain bg-white/20 p-1"
              />
            ) : (
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                <Wifi className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-white">{company.name}</h1>
              <p className="text-white/80 text-sm mt-1">Wi-Fi Gratuito</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            <p className="text-gray-600 text-sm text-center mb-5">
              {company.welcomeText}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              {/* Nome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  {...register('name')}
                  type="text"
                  autoComplete="name"
                  placeholder="Seu nome"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                  style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  autoComplete="tel"
                  placeholder="(00) 00000-0000"
                  onChange={handlePhoneChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 transition"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>

              {/* LGPD */}
              {company.lgpdEnabled && (
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    {...register('lgpdAccepted')}
                    type="checkbox"
                    className="mt-0.5 rounded"
                    style={{ accentColor: primaryColor }}
                  />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    {company.lgpdText ||
                      'Concordo com a Política de Privacidade e o uso dos meus dados.'}
                  </span>
                </label>
              )}

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || (company.lgpdEnabled && !lgpdAccepted)}
                className="w-full py-4 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
                style={{ background: primaryColor }}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    Conectar à Internet
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-center gap-2">
            <Shield className="w-3 h-3 text-gray-300" />
            <p className="text-gray-400 text-xs text-center">{company.footerText}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
