//components/pages/ContactPageContent.tsx
'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from 'lucide-react'
import { useState } from "react"

export default function ContactPageContent() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  
  const handleSubmit = async (e: any) => {
    e.preventDefault()
  
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      })
  
      const data = await res.json()
  
      if (data.success) {
        alert("Message sent successfully!")
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        })
      } else {
        alert("Something went wrong")
      }
    } catch (err) {
      alert("Error sending message")
    }
  }
  return (
    <div className="min-h-screen bg-white">
      {/* HERO SECTION - Dynamic Background */}
      <section className="relative py-28 text-center overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-50/50 rounded-full blur-3xl -z-10 opacity-60" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-100/40 rounded-full blur-3xl -z-10" />
        
        <div className="relative z-10 px-6">
          <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide uppercase mb-6 inline-block">
            Get in Touch
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-none">
            Let's Start a <span className="text-blue-600 italic">Conversation</span>
          </h1>
          <p className="text-sm text-gray-500 mt-2">
  For support, general queries, or partnership opportunities
</p>
          <p className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We’re here to support your learning journey. Whether you have questions, need assistance, or want to explore collaboration opportunities, our team is ready to help. Expect a response within 24 hours.          </p>
        </div>
      </section>

      {/* MAIN CONTENT - Split Layout */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* LEFT SIDE: Contact Info (Col-5) */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">Contact Information</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
              Have a question, need support, or want to partner with us? Reach out anytime — our team typically responds within 24 hours.              </p>
            </div>

            <div className="grid gap-6">
              <ContactMethod 
                icon={<Mail className="w-6 h-6" />}
                label="Email us at"
                value="support@readnrevise.com"
                href="mailto:support@readnrevise.com"
              />
              <ContactMethod 
                icon={<Phone className="w-6 h-6" />}
                label="Call us"
                value="+91 98765 43210"
                href="tel:+919876543210"
              />
              <ContactMethod 
                icon={<MapPin className="w-6 h-6" />}
                label="Visit us"
                value="ReadNRevise, India"
                href="#"
              />
            </div>

            {/* Quick Stats/Badges */}
            <div className="flex gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Rapid Response</h4>
                <p className="text-sm text-gray-600">Average response time is currently under 4 hours.</p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Interactive Form (Col-7) */}
          <div className="lg:col-span-7">
            <div className="relative group">
              {/* Decorative glow behind form */}
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
              
              <div className="relative bg-white border border-slate-100 rounded-[2rem] p-8 md:p-12 shadow-2xl">
                <div className="mb-10">
                  <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquare className="text-blue-600" />
                    Send a Message
                  </h3>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Full Name</label>
                      <Input 
  placeholder="John Doe"
  value={form.name}
  onChange={(e) => setForm({ ...form, name: e.target.value })}
  className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl"
/>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Email Address</label>
                      <Input 
  type="email"
  placeholder="john@example.com"
  value={form.email}
  onChange={(e) => setForm({ ...form, email: e.target.value })}
  className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl"
/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Subject</label>
                    <Input 
  placeholder="How can we help?"
  value={form.subject}
  onChange={(e) => setForm({ ...form, subject: e.target.value })}
  className="h-14 bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl"
/>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Message</label>
                    <Textarea 
  placeholder="Tell us more about your inquiry..."
  rows={6}
  value={form.message}
  onChange={(e) => setForm({ ...form, message: e.target.value })}
  className="bg-slate-50/50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500 transition-all rounded-xl resize-none"
/>
                  </div>

                 <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group/btn transition-all">
                    Send Message
                    <Send className="w-5 h-5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                  </Button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* FAQ CTA */}
      <section className="border-t border-slate-100 py-20 bg-slate-50/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Prefer self-service?</h3>
          <p className="text-gray-600 mb-8">Check out our frequently asked questions for quick answers.</p>
          <Button variant="outline" className="rounded-full px-8 h-12 border-blue-200 text-blue-600 hover:bg-blue-50">
            Visit Help Center
          </Button>
        </div>
      </section>
    </div>
  )
}

function ContactMethod({ icon, label, value, href }: any) {
  return (
    <a 
      href={href}
      className="flex items-center gap-5 p-4 rounded-2xl border border-transparent hover:border-blue-100 hover:bg-blue-50/50 transition-all group"
    >
      <div className="w-14 h-14 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-lg font-bold text-slate-800">{value}</p>
      </div>
    </a>
  )
}