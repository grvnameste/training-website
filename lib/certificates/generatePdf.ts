//lib/certificates/generatePdf.ts
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
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

  const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const textFont = await pdfDoc.embedFont(StandardFonts.Helvetica)

  // Background
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 802,
    height: 555,
    borderWidth: 2,
    borderColor: rgb(0.2, 0.4, 0.8),
  })

  // Title
  page.drawText('Certificate of Completion', {
    x: 220,
    y: 460,
    size: 30,
    font: titleFont,
    color: rgb(0.1, 0.1, 0.1),
  })

  // Body
  page.drawText('This is to certify that', {
    x: 300,
    y: 390,
    size: 16,
    font: textFont,
  })

  page.drawText(data.studentName, {
    x: 250,
    y: 350,
    size: 22,
    font: titleFont,
    color: rgb(0.2, 0.2, 0.7),
  })

  page.drawText('has successfully completed the course', {
    x: 240,
    y: 315,
    size: 16,
    font: textFont,
  })

  page.drawText(data.courseName, {
    x: 260,
    y: 280,
    size: 20,
    font: titleFont,
  })

  // Footer
  page.drawText(`Issued on: ${data.issueDate}`, {
    x: 60,
    y: 80,
    size: 12,
    font: textFont,
  })

  page.drawText(`Certificate ID: ${data.certificateId}`, {
    x: 60,
    y: 60,
    size: 10,
    font: textFont,
    color: rgb(0.4, 0.4, 0.4),
  })

  return await pdfDoc.save()
}
