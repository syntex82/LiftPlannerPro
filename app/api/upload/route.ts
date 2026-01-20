import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { storageConfig } from '@/lib/storage-config'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileType = formData.get('type') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = [
      ...storageConfig.ALLOWED_IMAGE_TYPES,
      ...storageConfig.ALLOWED_CAD_TYPES,
      ...storageConfig.ALLOWED_DOCUMENT_TYPES
    ]
    
    const fileExtension = path.extname(file.name).toLowerCase()
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    // Create user directory
    const userDir = path.join(storageConfig.UPLOAD_DIR, session.user.id)
    if (!existsSync(userDir)) {
      await mkdir(userDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedName}`
    const filePath = path.join(userDir, fileName)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return file info
    return NextResponse.json({
      success: true,
      fileName,
      originalName: file.name,
      size: file.size,
      type: fileType,
      path: `/api/files/${session.user.id}/${fileName}`
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ 
      error: 'Upload failed' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // List user files
    const userDir = path.join(storageConfig.UPLOAD_DIR, session.user.id)
    if (!existsSync(userDir)) {
      return NextResponse.json({ files: [] })
    }

    const fs = require('fs')
    const files = fs.readdirSync(userDir).map((fileName: string) => {
      const filePath = path.join(userDir, fileName)
      const stats = fs.statSync(filePath)
      
      return {
        name: fileName,
        size: stats.size,
        modified: stats.mtime,
        path: `/api/files/${session.user.id}/${fileName}`
      }
    })

    return NextResponse.json({ files })

  } catch (error) {
    console.error('File list error:', error)
    return NextResponse.json({ error: 'Failed to list files' }, { status: 500 })
  }
}
