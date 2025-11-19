'use server'

import { put, del } from '@vercel/blob'

/**
 * Upload file to Vercel Blob
 *
 * @param file - The file to upload
 * @param leadId - Lead ID for organizing files
 * @returns Object with URL and size of uploaded file
 */
export async function uploadToBlob(
  file: File,
  leadId: string
): Promise<{
  url: string
  size: number
}> {
  // Path: leads/{leadId}/{timestamp}-{filename}
  const timestamp = Date.now()
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
  const path = `leads/${leadId}/${timestamp}-${safeName}`

  const blob = await put(path, file, {
    access: 'public',
    addRandomSuffix: false,
  })

  return {
    url: blob.url,
    size: file.size, // Use the File's size
  }
}

/**
 * Delete file from Vercel Blob
 *
 * @param url - The blob URL to delete
 */
export async function deleteFromBlob(url: string): Promise<void> {
  await del(url)
}

/**
 * Upload base64 encoded file to Vercel Blob
 *
 * @param base64Data - Base64 encoded file data
 * @param fileName - Name for the file
 * @param leadId - Lead ID for organizing files
 * @param mimeType - MIME type of the file (default: application/pdf)
 * @returns Object with URL and size of uploaded file
 */
export async function uploadBase64ToBlob(
  base64Data: string,
  fileName: string,
  leadId: string,
  mimeType = 'application/pdf'
): Promise<{
  url: string
  size: number
}> {
  // Convert base64 to Buffer
  const buffer = Buffer.from(base64Data, 'base64')

  // Create Blob from buffer
  const blob = new Blob([buffer], { type: mimeType })

  // Create File object
  const file = new File([blob], fileName, { type: mimeType })

  // Upload using existing function
  return uploadToBlob(file, leadId)
}