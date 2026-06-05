// src/app/admin/dashboard/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, startOfWeek, startOfMonth, subDays, format } from 'date-fns'
import DashboardClient from './dashboard-client'

export const metadata = { title: 'Dashboard — Wi-Fi Portal' }

export default async function DashboardPage() {
  const session = await auth()
  const isSuperAdmin = (session?.user as any)?.role === 'SUPER_ADMIN'
  const sessionCompanyId = (session?.user as any)?.companyId
  const now = new Date()

  const where: any = isSuperAdmin ? {} : { companyId: sessionCompanyId }

  const [totalLeads, totalConnections, leadsToday, leadsWeek, leadsMonth, activeCampaigns, activePromotions, rawLeads] =
    await Promise.all([
      prisma.wifiLead.count({ where }),
      prisma.accessLog.count({ where }),
      prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfDay(now) } } }),
      prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfWeek(now, { weekStartsOn: 1 }) } } }),
      prisma.wifiLead.count({ where: { ...where, createdAt: { gte: startOfMonth(now) } } }),
      prisma.campaign.count({ where: { ...where, active: true, startDate: { lte: now }, endDate: { gte: now } } }),
      prisma.promotion.count({ where: { active: true, campaign: { ...where, active: true, startDate: { lte: now }, endDate: { gte: now } } } }),
      prisma.wifiLead.findMany({ where: { ...where, createdAt: { gte: subDays(now, 29) } }, select: { createdAt: true } }),
    ])

  const dailyMap: Record<string, number> = {}
  for (let i = 0; i < 30; i++) {
    dailyMap[format(subDays(now, 29 - i), 'yyyy-MM-dd')] = 0
  }
  for (const l of rawLeads) {
    const d = format(l.createdAt, 'yyyy-MM-dd')
    if (dailyMap[d] !== undefined) dailyMap[d]++
  }

  const dailyLeads = Object.entries(dailyMap).map(([date, count]) => ({ date, count }))

  return (
    <DashboardClient
      stats={{ totalLeads, totalConnections, leadsToday, leadsThisWeek: leadsWeek, leadsThisMonth: leadsMonth, activeCampaigns, activePromotions, dailyLeads }}
    />
  )
}
