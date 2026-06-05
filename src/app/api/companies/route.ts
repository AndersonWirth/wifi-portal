// src/app/api/companies/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validations'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const companyId = (session.user as any).companyId

  const companies = await prisma.company.findMany({
    where: isSuperAdmin ? {} : { id: companyId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { leads: true, campaigns: true } } },
  })

  return NextResponse.json(companies)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const parsed = companySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })
  }

  // Check slug uniqueness
  const exists = await prisma.company.findUnique({ where: { slug: parsed.data.slug } })
  if (exists) {
    return NextResponse.json({ error: 'Este slug já está em uso.' }, { status: 409 })
  }

  const company = await prisma.company.create({ data: parsed.data })
  return NextResponse.json(company, { status: 201 })
}
