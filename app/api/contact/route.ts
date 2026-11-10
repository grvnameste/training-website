import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY!,
      },
      body: JSON.stringify({
        sender: {
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: process.env.BREVO_RECEIVER_EMAIL,
          },
        ],

        // ✅ ADD THIS (important)
        replyTo: {
          email: email,
        },

        subject: subject || "New Contact Form Submission",

        htmlContent: `
          <h3>New Message</h3>
          <p><b>Name:</b> ${name}</p>
          <p><b>Email:</b> ${email}</p>
          <p><b>Message:</b> ${message}</p>
        `,
      }),
    })

    if (!res.ok) {
      console.log("Brevo error:", await res.text())
      throw new Error("Email failed")
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}