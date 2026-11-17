import { NextResponse } from 'next/server'
import { enforceRateLimit } from '@/lib/http/rate-limit'

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  const limited = enforceRateLimit(request, 'contact', 5, 10 * 60_000)
  if (limited) return limited

  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required fields' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Invalid email address format' }, { status: 400 })
    }

    // Truncate fields to prevent abuse
    const safeName = escapeHtml(String(name).slice(0, 100))
    const safeEmail = escapeHtml(String(email).slice(0, 150))
    const safeSubject = escapeHtml(String(subject || 'New Contact Form Submission').slice(0, 200))
    const safeMessage = escapeHtml(String(message).slice(0, 4000)).replace(/\n/g, '<br/>')

    const apiKey = process.env.BREVO_API_KEY
    const senderEmail = process.env.BREVO_SENDER_EMAIL || 'support@readnrevise.com'
    const receiverEmail = process.env.BREVO_RECEIVER_EMAIL || 'contact@readnrevise.com'

    if (!apiKey) {
      console.warn('[api/contact] Brevo API key not configured. Mocking email delivery.')
      return NextResponse.json({ success: true, mocked: true })
    }

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        sender: {
          email: senderEmail,
        },
        to: [
          {
            email: receiverEmail,
          },
        ],
        replyTo: {
          email: email,
        },
        subject: safeSubject,
        htmlContent: `
          <h3>New Contact Inquiry</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <div style="padding: 12px; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 4px;">
            ${safeMessage}
          </div>
        `,
      }),
    })

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('Brevo API response error:', errText)
      throw new Error('Email dispatch failed')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact form submission error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send message' }, { status: 500 })
  }
}