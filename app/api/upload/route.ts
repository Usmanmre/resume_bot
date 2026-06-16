import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

async function ensureUploadDir() {
  try {
    await fs.promises.access(UPLOAD_DIR)
  } catch (err) {
    // ignore error if directory doesn't exist
    void err
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export async function POST(req: Request) {
  // Only accept multipart/form-data
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Content-Type must be multipart/form-data' }, { status: 415 })
  }

  const formData = await req.formData()
  const fileEntry = formData.get('file')
  if (!fileEntry || !(fileEntry instanceof File)) {
    return NextResponse.json({ error: 'No file provided under "file" field' }, { status: 400 })
  }

  const file = fileEntry as File

  // Basic validation
  const fileType = file.type || ''
  const fileName = file.name || `upload-${Date.now()}`
  if (fileType !== 'application/pdf' && !fileName.toLowerCase().endsWith('.pdf')) {
    return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  if (arrayBuffer.byteLength > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `File too large. Max ${MAX_FILE_SIZE} bytes` }, { status: 413 })
  }

  await ensureUploadDir()

  // Create a safe, unique filename
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')
  const outName = `${uniqueSuffix}-${safeName}`
  const outPath = path.join(UPLOAD_DIR, outName)

  // Write file
  const buffer = Buffer.from(arrayBuffer)
  await fs.promises.writeFile(outPath, buffer)

  // Return public URL (served from /public)
  const publicUrl = `/uploads/${outName}`
  return NextResponse.json({ url: publicUrl, name: outName }, { status: 201 })
}

export const runtime = 'nodejs'
