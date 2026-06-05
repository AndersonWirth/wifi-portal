// src/types/index.ts
import type { Company, Campaign, Promotion, PromotionImage, WifiLead } from '@prisma/client'

export type { Company, Campaign, Promotion, PromotionImage, WifiLead }

export interface MikroTikParams {
  mac?: string
  ip?: string
  'link-login'?: string
  'link-login-only'?: string
  'link-orig'?: string
  username?: string
  error?: string
}

export interface PortalCompany {
  id: string
  name: string
  slug: string
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  pageTitle: string
  welcomeText: string
  footerText: string
  postLoginRedirectUrl: string | null
  lgpdEnabled: boolean
  lgpdText: string | null
}

export interface CampaignWithPromotions extends Campaign {
  promotions: (Promotion & {
    images: PromotionImage[]
  })[]
}

export interface DashboardStats {
  totalLeads: number
  totalConnections: number
  activeCampaigns: number
  activePromotions: number
  leadsToday: number
  leadsThisWeek: number
  leadsThisMonth: number
  dailyLeads: { date: string; count: number }[]
}

export interface LeadWithCompany extends WifiLead {
  company: { name: string; slug: string }
}
