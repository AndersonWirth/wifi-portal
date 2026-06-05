// src/app/portal/[slug]/promocoes/page.tsx
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import type { Metadata } from 'next'
import PromocoesClient from './promocoes-client'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await prisma.company.findUnique({
    where: { slug, active: true },
    select: { name: true, pageTitle: true },
  })
  if (!company) return { title: 'Promoções' }
  return { title: `Promoções — ${company.name}` }
}

export default async function PromocoesPage({ params }: Props) {
  const { slug } = await params
  const now = new Date()

  const company = await prisma.company.findUnique({
    where: { slug, active: true },
    select: {
      id: true, name: true, slug: true, logoUrl: true,
      primaryColor: true, secondaryColor: true, accentColor: true,
    },
  })
  if (!company) notFound()

  const campaigns = await prisma.campaign.findMany({
    where: {
      companyId: company.id,
      active: true,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      promotions: {
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          images: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
    orderBy: { startDate: 'desc' },
  })

  return <PromocoesClient company={company} campaigns={campaigns} />
}
