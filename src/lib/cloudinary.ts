// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

export async function uploadImage(
  file: string, // base64 or URL
  folder: string,
  publicId?: string
) {
  const result = await cloudinary.uploader.upload(file, {
    folder: `wifi-portal/${folder}`,
    public_id: publicId,
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { quality: 'auto:best', fetch_format: 'auto' },
    ],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    size: result.bytes,
    format: result.format,
    hash: result.etag,
  }
}

export async function deleteImage(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
