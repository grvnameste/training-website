'use client'
import Link from 'next/link'
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-2xl font-black text-blue-600 tracking-tight">
              ReadNRevise
            </Link>
            <p className="mt-4 text-slate-500 leading-relaxed text-sm">
              The ultimate workspace for future software architects. Master the SDLC through real team collaboration.
            </p>
            <div className="flex gap-4 mt-6">
  <SocialIcon 
    icon={<Github size={18} />} 
    href="https://github.com/ReadNRevise" 
  />

  <SocialIcon 
    icon={<Linkedin size={18} />} 
    href="https://www.linkedin.com/company/readnrevise/posts/?feedView=all" 
  />

  <SocialIcon 
    icon={<Twitter size={18} />} 
    href="https://twitter.com/" 
  />
</div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Platform</h3>
            <ul className="space-y-4 text-sm text-slate-600">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
              <li><Link href="/courses" className="hover:text-blue-600 transition-colors">Courses</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Business Links */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Solutions</h3>
            <ul className="space-y-4 text-sm text-slate-600">
            <li><Link href="/Forstudents" className="hover:text-blue-600 transition-colors">For Students</Link></li>
            <li><Link href="/Forinstitution" className="hover:text-blue-600 transition-colors">For Institutions</Link></li>              <li><Link href="#" className="hover:text-blue-600 transition-colors">Enterprise</Link></li>
            </ul>
          </div>

          {/* Contact Support */}
          <div>
            <h3 className="font-bold text-slate-900 mb-6 uppercase text-xs tracking-widest">Support</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Mail size={16} className="text-blue-600" />
                <span>support@readnrevise.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-blue-600" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin size={16} className="text-blue-600" />
                <span>India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © 2026 ReadNRevise. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
  <Link href="/privacyPolicy" className="hover:text-slate-600">
    Privacy Policy
  </Link>
  <Link href="/termsCondition" className="hover:text-slate-600">
    Terms & Conditions
  </Link>
</div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all"
    >
      {icon}
    </Link>
  )
}