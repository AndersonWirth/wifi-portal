// src/app/api/leads/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId

  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') || 1))
  const limit = Math.min(100, Number(searchParams.get('limit') || 20))
  const search = searchParams.get('search') || ''
  const companyId = searchParams.get('companyId') || ''
  const phone = searchParams.get('phone') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const format = searchParams.get('format') || ''

  const where: any = {}

  if (!isSuperAdmin) {
    where.companyId = sessionCompanyId
  } else if (companyId) {
    where.companyId = companyId
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search } },
    ]
  }

  if (phone) where.phone = { contains: phone }

  if (from || to) {
    where.createdAt = {}
    if (from) where.createdAt.gte = new Date(from)
    if (to) {
      const toDate = new Date(to)
      toDate.setHours(23, 59, 59, 999)
      where.createdAt.lte = toDate
    }
  }

  // CSV / Excel export
  if (format === 'csv' || format === 'xlsx') {
    const leads = await prisma.wifiLead.findMany({
      where,
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    })

    const rows = leads.map((l) => ({
      Nome: l.name,
      Telefone: l.phone,
      Empresa: l.company.name,
      IP: l.ipAddress || '',
      MAC: l.macAddress || '',
      LGPD: l.lgpdAccepted ? 'Sim' : 'Não',
      Data: l.createdAt.toLocaleString('pt-BR'),
    }))

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {}).join(',')
      const csvRows = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(','))
      const csv = [headers, ...csvRows].join('\n')
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="leads.csv"',
        },
      })
    }

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="leads.xlsx"',
      },
    })
  }

  const [total, leads] = await Promise.all([
    prisma.wifiLead.count({ where }),
    prisma.wifiLead.findMany({
      where,
      include: { company: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ])

  return NextResponse.json({ leads, total, page, limit, pages: Math.ceil(total / limit) })
}
