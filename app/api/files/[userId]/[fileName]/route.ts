import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { storageConfig } from '@/lib/storage-config'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; fileName: string }> }
) {
  const { userId, fileName } = await params
  try {
    const session = await getServerSession(authOptions)
    
    // Check if user is accessing their own files or is admin
    if (!session?.user?.id ||
        (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = path.join(storageConfig.UPLOAD_DIR, userId, fileName)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Read file
    const fileBuffer = await readFile(filePath)
    
    // Determine content type
    const ext = path.extname(fileName).toLowerCase()
    let contentType = 'application/octet-stream'
    
    const mimeTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.json': 'application/json',
      '.svg': 'image/svg+xml',
      '.txt': 'text/plain',
      '.dwg': 'application/acad',
      '.dxf': 'application/dxf'
    }
    
    if (mimeTypes[ext]) {
      contentType = mimeTypes[ext]
    }

    // Return file with appropriate headers
    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'private, max-age=3600'
      }
    })

  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; fileName: string }> }
) {
  const { userId, fileName } = await params
  try {
    const session = await getServerSession(authOptions)

    // Check if user is deleting their own files or is admin
    if (!session?.user?.id ||
        (session.user.id !== userId && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const filePath = path.join(storageConfig.UPLOAD_DIR, userId, fileName)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete file
    const fs = require('fs')
    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true, message: 'File deleted' })

  } catch (error) {
    console.error('File delete error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
