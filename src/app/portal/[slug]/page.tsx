// src/app/portal/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import PortalClient from './portal-client'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    mac?: string
    ip?: string
    'link-login'?: string
    'link-login-only'?: string
    'link-orig'?: string
    username?: string
    error?: string
  }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await prisma.company.findUnique({
    where: { slug, active: true },
    select: { pageTitle: true, faviconUrl: true, name: true },
  })
  if (!company) return { title: 'Portal Wi-Fi' }
  return {
    title: company.pageTitle,
    icons: company.faviconUrl ? [{ url: company.faviconUrl }] : undefined,
  }
}

export default async function PortalPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const company = await prisma.company.findUnique({
    where: { slug, active: true },
    select: {
      id: true,
      name: true,
      slug: true,
      logoUrl: true,
      primaryColor: true,
      secondaryColor: true,
      accentColor: true,
      pageTitle: true,
      welcomeText: true,
      footerText: true,
      postLoginRedirectUrl: true,
      lgpdEnabled: true,
      lgpdText: true,
    },
  })

  if (!company) notFound()

  return (
    <PortalClient
      company={company}
      mikrotik={{
        mac: sp.mac,
        ip: sp.ip,
        linkLogin: sp['link-login'],
        linkLoginOnly: sp['link-login-only'],
        linkOrig: sp['link-orig'],
      }}
    />
  )
}
