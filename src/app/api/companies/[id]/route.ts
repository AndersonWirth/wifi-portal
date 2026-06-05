// src/app/api/companies/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { companySchema } from '@/lib/validations'

async function authorize(session: any, companyId: string) {
  if (!session) return false
  const role = session.user?.role
  if (role === 'SUPER_ADMIN') return true
  if (role === 'COMPANY_ADMIN' && session.user?.companyId === companyId) return true
  return false
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!(await authorize(session, id))) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const company = await prisma.company.findUnique({ where: { id }, include: { _count: { select: { leads: true, campaigns: true } } } })
  if (!company) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(company)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!(await authorize(session, id))) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const parsed = companySchema.partial().safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 })

  const company = await prisma.company.update({ where: { id }, data: parsed.data })
  return NextResponse.json(company)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session || (session.user as any).role !== 'SUPER_ADMIN') return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  await prisma.company.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
