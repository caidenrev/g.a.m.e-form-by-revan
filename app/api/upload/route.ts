import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing credentials:', { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret })
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Prepare upload to Cloudinary
    const timestamp = Math.round(Date.now() / 1000).toString()
    
    // Generate signature: SHA1 of "timestamp=<timestamp><api_secret>"
    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    // Create form data
    const uploadData = new FormData()
    uploadData.append('file', new Blob([buffer], { type: file.type }))
    uploadData.append('api_key', apiKey)
    uploadData.append('timestamp', timestamp)
    uploadData.append('signature', signature)

    console.log('Uploading to Cloudinary:', { cloudName, timestamp })

    // Upload to Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: uploadData,
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Cloudinary error:', result)
      return NextResponse.json({ error: result.error?.message || 'Upload failed' }, { status: response.status })
    }

    return NextResponse.json({ secure_url: result.secure_url })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
