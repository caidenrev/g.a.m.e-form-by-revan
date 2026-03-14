import { NextRequest, NextResponse } from 'next/server'
import { jsPDF } from 'jspdf'
import path from 'path'
import fs from 'fs'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const participantName = searchParams.get('name') || 'Participant Name'
  
  // Generate a random certificate code
  const certCode = 'GAME-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  
  try {
    // Determine the path to the background image
    const imagePath = path.join(process.cwd(), 'public', 'images', 'Sertifikat G.A.M.E.png')
    const imageBuffer = fs.readFileSync(imagePath)
    
    // Convert to base64 for jsPDF
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`

    // Create a new PDF document (A4 Landscape is typical: 297x210mm)
    // Assume the image is landscape. We'll set the PDF size to match A4
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()

    // Add the background image
    doc.addImage(base64Image, 'PNG', 0, 0, width, height)

    // Configure text styling
    doc.setTextColor(50, 50, 50)
    
    // Add Participant Name (Center-aligned, approx middle of the page)
    doc.setFontSize(40)
    // using Helvetica bold as standard fallback since we don't have custom fonts loaded
    doc.setFont("helvetica", "bold") 
    // Y coordinate (approx 105 is middle, adjust downwards based on where the blank space is in the mockup)
    // Note: Assuming the blank name space is somewhat central. We might need to adjust Y later if the user gives feedback.
    doc.text(participantName, width / 2, 115, { align: 'center' })

    // Add Certificate Code (Bottom left or right)
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    // Bottom right corner
    doc.text(`ID: ${certCode}`, width - 15, height - 15, { align: 'right' })

    // Get PDF as ArrayBuffer
    const pdfOutput = doc.output('arraybuffer')

    return new NextResponse(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Sertifikat-${participantName.replace(/\s+/g, '-')}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Certificate generation failed:", error)
    return new NextResponse("Failed to generate certificate", { status: 500 })
  }
}
