// src/app/api/portal/connect/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { connectSchema } from '@/lib/validations'
import { rateLimit } from '@/lib/rate-limit'
import { getClientIp, sanitizeString } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req)

    // Rate limit by IP
    const limit = rateLimit(`connect:${ip}`)
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Aguarde alguns minutos.' },
        { status: 429 }
      )
    }

    const body = await req.json()
    const parsed = connectSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      )
    }

    const { name, phone, companyId, mac, lgpdAccepted } = parsed.data

    // Verify company exists and is active
    const company = await prisma.company.findUnique({
      where: { id: companyId, active: true },
      select: { id: true, lgpdEnabled: true, postLoginRedirectUrl: true },
    })

    if (!company) {
      return NextResponse.json({ error: 'Empresa não encontrada.' }, { status: 404 })
    }

    // Enforce LGPD if enabled
    if (company.lgpdEnabled && !lgpdAccepted) {
      return NextResponse.json(
        { error: 'Aceite da política de privacidade é obrigatório.' },
        { status: 422 }
      )
    }

    const userAgent = req.headers.get('user-agent') || undefined

    // Save lead
    await prisma.wifiLead.create({
      data: {
        companyId,
        name: sanitizeString(name),
        phone,
        ipAddress: ip,
        macAddress: mac ? sanitizeString(mac) : undefined,
        userAgent,
        origin: req.headers.get('referer') || undefined,
        lgpdAccepted: lgpdAccepted ?? false,
      },
    })

    // Save access log
    await prisma.accessLog.create({
      data: {
        companyId,
        ipAddress: ip,
        macAddress: mac ? sanitizeString(mac) : undefined,
        userAgent,
        success: true,
      },
    })

    return NextResponse.json({
      success: true,
      redirectUrl: company.postLoginRedirectUrl,
    })
  } catch (error) {
    console.error('[portal/connect]', error)
    return NextResponse.json(
      { error: 'Erro interno. Tente novamente.' },
      { status: 500 }
    )
  }
}
