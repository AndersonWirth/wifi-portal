// src/app/api/companies/[id]/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const isSuperAdmin = (session.user as any).role === 'SUPER_ADMIN'
  const sessionCompanyId = (session.user as any).companyId
  if (!isSuperAdmin && sessionCompanyId !== id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const company = await prisma.company.findUnique({ where: { id } })
  if (!company) return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string // 'logo' | 'favicon'

  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  if (!['logo', 'favicon'].includes(type)) return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })

  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 5MB' }, { status: 413 })
  }

  // Delete old image if exists
  const oldPublicId = type === 'logo' ? company.logoPublicId : company.faviconPublicId
  if (oldPublicId) {
    await deleteImage(oldPublicId).catch(() => {}) // ignore errors
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const uploaded = await uploadImage(base64, `companies/${id}`, `${id}-${type}`)

  const updateData =
    type === 'logo'
      ? { logoUrl: uploaded.url, logoPublicId: uploaded.publicId }
      : { faviconUrl: uploaded.url, faviconPublicId: uploaded.publicId }

  const updated = await prisma.company.update({ where: { id }, data: updateData })

  return NextResponse.json({
    url: type === 'logo' ? updated.logoUrl : updated.faviconUrl,
  })
}
