// src/lib/validations.ts
import { z } from 'zod'

export const connectSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres')
    .max(100, 'Nome muito longo')
    .transform((v) => v.trim()),
  phone: z
    .string()
    .min(10, 'Telefone inválido')
    .max(20, 'Telefone inválido')
    .transform((v) => v.replace(/\D/g, '')),
  companyId: z.string().cuid(),
  mac: z.string().optional(),
  ip: z.string().optional(),
  linkLoginOnly: z.string().url().optional().or(z.literal('')),
  lgpdAccepted: z.boolean().optional().default(false),
})

export const companySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  pageTitle: z.string().min(2).max(100),
  welcomeText: z.string().min(2).max(500),
  footerText: z.string().max(500).optional(),
  customDomain: z.string().optional().nullable(),
  postLoginRedirectUrl: z.string().url().optional().nullable(),
  lgpdEnabled: z.boolean().default(false),
  lgpdText: z.string().max(1000).optional().nullable(),
  active: z.boolean().default(true),
})

export const campaignSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional().nullable(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  active: z.boolean().default(true),
})

export const promotionSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().max(2000).optional().nullable(),
  sortOrder: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
  campaignId: z.string().cuid(),
})

export type ConnectInput = z.infer<typeof connectSchema>
export type CompanyInput = z.infer<typeof companySchema>
export type CampaignInput = z.infer<typeof campaignSchema>
export type PromotionInput = z.infer<typeof promotionSchema>
