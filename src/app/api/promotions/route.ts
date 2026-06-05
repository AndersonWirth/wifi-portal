// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { promotionSchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const campaignId = req.nextUrl.searchParams.get('campaignId')
  if (!campaignId) return NextResponse.json({ error: 'campaignId obrigatório' }, { status: 400 })

  const promotions = await prisma.promotion.findMany({
    where: { campaignId },
    orderBy: { sortOrder: 'asc' },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  })
  return NextResponse.json(promotions)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = promotionSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })

  const promotion = await prisma.promotion.create({ data: parsed.data })
  return NextResponse.json(promotion, { status: 201 })
}
