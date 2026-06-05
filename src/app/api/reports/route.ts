// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, startOfMonth, subDays, subMonths, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId
  const { searchParams } = req.nextUrl

  const period = searchParams.get('period') || 'month' // today | week | month | custom
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const now = new Date()

  let startDate: Date
  let endDate = now

  switch (period) {
    case 'today':
      startDate = startOfDay(now)
      break
    case 'week':
      startDate = subDays(now, 6)
      break
    case 'custom':
      startDate = from ? new Date(from) : subDays(now, 30)
      endDate = to ? new Date(to) : now
      break
    default: // month
      startDate = startOfMonth(now)
  }

  const where: any = {
    ...(isSuperAdmin ? {} : { companyId: sessionCompanyId }),
    createdAt: { gte: startDate, lte: endDate },
  }

  // Leads por empresa (super admin)
  const leadsByCompany = isSuperAdmin
    ? await prisma.wifiLead.groupBy({
        by: ['companyId'],
        where: { createdAt: { gte: startDate, lte: endDate } },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      })
    : []

  // Busca nomes das empresas
  let companiesMap: Record<string, string> = {}
  if (leadsByCompany.length > 0) {
    const companies = await prisma.company.findMany({
      where: { id: { in: leadsByCompany.map(l => l.companyId) } },
      select: { id: true, name: true },
    })
    companiesMap = Object.fromEntries(companies.map(c => [c.id, c.name]))
  }

  // Totals
  const [totalLeads, totalConnections] = await Promise.all([
    prisma.wifiLead.count({ where }),
    prisma.accessLog.count({ where }),
  ])

  // Monthly growth (last 6 months)
  const monthlyGrowth = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const monthStart = startOfMonth(subMonths(now, 5 - i))
      const monthEnd = startOfMonth(subMonths(now, 4 - i))
      return prisma.wifiLead
        .count({
          where: {
            ...(isSuperAdmin ? {} : { companyId: sessionCompanyId }),
            createdAt: { gte: monthStart, lt: monthEnd },
          },
        })
        .then(count => ({
          month: format(monthStart, 'MMM/yy'),
          leads: count,
        }))
    })
  )

  return NextResponse.json({
    totalLeads,
    totalConnections,
    monthlyGrowth,
    leadsByCompany: leadsByCompany.map(l => ({
      company: companiesMap[l.companyId] || l.companyId,
      count: l._count.id,
    })),
    period: { start: startDate, end: endDate },
  })
}
