// src/app/api/campaigns/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { campaignSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId
  const companyId = req.nextUrl.searchParams.get('companyId')

  const where: any = isSuperAdmin
    ? companyId ? { companyId } : {}
    : { companyId: sessionCompanyId }

  const campaigns = await prisma.campaign.findMany({
    where,
    include: {
      _count: { select: { promotions: true } },
      company: { select: { name: true } },
    },
    orderBy: { startDate: 'desc' },
  })

  return NextResponse.json(campaigns)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId

  const body = await req.json()
  const { companyId, ...rest } = body
  const targetCompanyId = isSuperAdmin ? companyId : sessionCompanyId

  if (!targetCompanyId) return NextResponse.json({ error: 'Empresa não informada' }, { status: 400 })

  const parsed = campaignSchema.safeParse(rest)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })

  const campaign = await prisma.campaign.create({
    data: { ...parsed.data, companyId: targetCompanyId },
  })
  return NextResponse.json(campaign, { status: 201 })
}
