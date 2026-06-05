// src/app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId
  const now = new Date()

  const where: any = isSuperAdmin ? {} : { companyId: sessionCompanyId }

  const [
    totalLeads,
    totalConnections,
    leadsToday,
    leadsWeek,
    leadsMonth,
    activeCampaigns,
    activePromotions,
  ] = await Promise.all([
    prisma.wifiLead.count({ where }),
    prisma.accessLog.count({ where }),
    prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfDay(now) } } }),
    prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfWeek(now, { weekStartsOn: 1 }) } } }),
    prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfMonth(now) } } }),
    prisma.campaign.count({ where: { ...where, active: true, startDate: { lte: now }, endDate: { gte: now } } }),
    prisma.promotion.count({
      where: {
        active: true,
        campaign: { ...where, active: true, startDate: { lte: now }, endDate: { gte: now } },
      },
    }),
  ])

  // Daily leads for the last 30 days
  const thirtyDaysAgo = subDays(now, 29)
  const rawLeads = await prisma.wifiLead.findMany({
    where: { ...where, createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  })

  const dailyMap: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    const d = format(subDays(now, 29 - i), 'yyyy-MM-dd')
    dailyMap[d] = 0
  }
  for (const lead of rawLeads) {
    const d = format(lead.createdAt, 'yyyy-MM-dd')
    if (dailyMap[d] !== undefined) dailyMap[d]++
  }
  const dailyLeads = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  return NextResponse.json({
    totalLeads,
    totalConnections,
    leadsToday,
    leadsThisWeek: leadsWeek,
    leadsThisMonth: leadsMonth,
    activeCampaigns,
    activePromotions,
    dailyLeads,
  })
}
