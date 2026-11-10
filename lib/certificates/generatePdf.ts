// lib/certificates/generatePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

interface CertificateData {
  studentName: string
  courseName: string
  issueDate: string
  certificateId: string
}

export async function generateCertificatePDF(
  data: CertificateData
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()

  // A4 Landscape
  const page = pdfDoc.addPage([842, 595])
  const { width, height } = page.getSize()

  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  /* ================= LOGO ================= */
  const logoPath = path.join(
    process.cwd(),
    'public/assets/Readnrevise_logo.png'
  )
  const logoBytes = fs.readFileSync(logoPath)
  const logoImage = await pdfDoc.embedPng(logoBytes)

  page.drawImage(logoImage, {
    x: 60,
    y: height - 110,
    width: 140,
    height: 40,
  })

  /* ================= BORDER ================= */
  page.drawRectangle({
    x: 25,
    y: 25,
    width: width - 50,
    height: height - 50,
    borderWidth: 2,
    borderColor: rgb(0.75, 0.75, 0.75),
  })

  /* ================= RIGHT RIBBON ================= */
  page.drawRectangle({
    x: width - 200,
    y: 25,
    width: 150,
    height: height - 50,
    color: rgb(0.94, 0.95, 0.97),
  })

  page.drawText('COURSE\nCERTIFICATE', {
    x: width - 170,
    y: height / 2 + 40,
    size: 16,
    font: boldFont,
    color: rgb(0.3, 0.3, 0.3),
    lineHeight: 20,
  })

  /* ================= MAIN CONTENT ================= */
  page.drawText('Certificate of Completion', {
    x: 60,
    y: height - 160,
    size: 28,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  page.drawText('This is proudly presented to', {
    x: 60,
    y: height - 210,
    size: 16,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(data.studentName, {
    x: 60,
    y: height - 260,
    size: 26,
    font: boldFont,
    color: rgb(0.1, 0.2, 0.6),
  })

  page.drawText('for successfully completing the course', {
    x: 60,
    y: height - 300,
    size: 15,
    font: regularFont,
    color: rgb(0.3, 0.3, 0.3),
  })

  page.drawText(data.courseName, {
    x: 60,
    y: height - 340,
    size: 20,
    font: boldFont,
    color: rgb(0.15, 0.15, 0.15),
  })

  /* ================= SIGNATURE ================= */
  page.drawText('Authorized by', {
    x: 60,
    y: 140,
    size: 12,
    font: regularFont,
  })

  page.drawText('ReadNRevise', {
    x: 60,
    y: 120,
    size: 14,
    font: boldFont,
  })

  /* ================= FOOTER ================= */
  page.drawText(`Issued on: ${data.issueDate}`, {
    x: width - 350,
    y: 90,
    size: 11,
    font: regularFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: width - 350,
    y: 70,
    size: 10,
    font: regularFont,
    color: rgb(0.5, 0.5, 0.5),
  })

  page.drawText(
    'Verify at: https://readnrevise.com/verify',
    {
      x: 60,
      y: 70,
      size: 10,
      font: regularFont,
      color: rgb(0.5, 0.5, 0.5),
    }
  )

  return await pdfDoc.save()
}
