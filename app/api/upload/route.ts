import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
// Import the clean, modern fork here:
import pdfParse from 'pdf-parse-fork'
import createEmbedding from '../../lib/embedding'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

async function ensureUploadDir() {
  try {
    await fs.promises.access(UPLOAD_DIR)
  } catch (err) {
    void err
    await fs.promises.mkdir(UPLOAD_DIR, { recursive: true })
  }
}

function chunkText(text: string, chunkSize = 800): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize))
  }
  return chunks
}

export async function POST(req: Request) {
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

  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const safeName = path.basename(fileName).replace(/[^a-zA-Z0-9._-]/g, '_')
  const outName = `${uniqueSuffix}-${safeName}`
  const outPath = path.join(UPLOAD_DIR, outName)

  const buffer = Buffer.from(arrayBuffer)
  await fs.promises.writeFile(outPath, buffer)

  const publicUrl = `/uploads/${outName}`
  let chunks: string[] = []

  try {
    // Look at how clean this is now! No generic casts needed.
    const data = await pdfParse(buffer)
    const text = data?.text || ''
    chunks = chunkText(text, 800)
  } catch (err: unknown) {
    const e = err as Error
    console.error('PDF parse error:', e?.message ?? e)
  }
  
  try {
    const embeddingResponse = await createEmbedding(chunks || '')
    console.log('Embedding response:', embeddingResponse.length)
  } catch (err: unknown) {
    const e = err as Error
    console.error('Embedding error:', e?.message ?? e)
  }

  return NextResponse.json(
    { url: publicUrl, name: outName, chunksCount: chunks.length, chunks: chunks.slice(0, 10) },
    { status: 201 }
  )
}

export const runtime = 'nodejs'