// src/app/api/promotions/[id]/images/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { uploadImage, deleteImage } from '@/lib/cloudinary'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const promotion = await prisma.promotion.findUnique({ where: { id } })
  if (!promotion) return NextResponse.json({ error: 'Promoção não encontrada' }, { status: 404 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo: 10MB' }, { status: 413 })
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 415 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = `data:${file.type};base64,${buffer.toString('base64')}`

  const uploaded = await uploadImage(base64, `promotions/${id}`)

  const existingCount = await prisma.promotionImage.count({ where: { promotionId: id } })

  const image = await prisma.promotionImage.create({
    data: {
      promotionId: id,
      url: uploaded.url,
      publicId: uploaded.publicId,
      width: uploaded.width,
      height: uploaded.height,
      size: uploaded.size,
      format: uploaded.format,
      hash: uploaded.hash,
      sortOrder: existingCount,
    },
  })

  return NextResponse.json(image, { status: 201 })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { imageId } = await req.json()
  const image = await prisma.promotionImage.findUnique({ where: { id: imageId } })
  if (!image) return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })

  await deleteImage(image.publicId)
  await prisma.promotionImage.delete({ where: { id: imageId } })

  return NextResponse.json({ success: true })
}
