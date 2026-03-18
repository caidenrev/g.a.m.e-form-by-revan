import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { publicId } = await request.json()
    
    if (!publicId) {
      return NextResponse.json({ error: 'No public_id provided' }, { status: 400 })
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Missing Cloudinary credentials')
      return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 500 })
    }

    // Generate timestamp
    const timestamp = Math.round(Date.now() / 1000).toString()
    
    // Generate signature for delete request
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign)
      .digest('hex')

    // Create form data for delete request
    const deleteData = new FormData()
    deleteData.append('public_id', publicId)
    deleteData.append('api_key', apiKey)
    deleteData.append('timestamp', timestamp)
    deleteData.append('signature', signature)

    console.log('Deleting from Cloudinary:', { publicId, timestamp })

    // Delete from Cloudinary
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: deleteData,
      }
    )

    const result = await response.json()

    if (!response.ok) {
      console.error('Cloudinary delete error:', result)
      return NextResponse.json({ error: result.error?.message || 'Delete failed' }, { status: response.status })
    }

    console.log('Cloudinary delete result:', result)
    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}