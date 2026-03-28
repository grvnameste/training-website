'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <div className="flex items-center">
          <Image
            src="/assets/Readnrevise_logo.png"
            alt="Logo"
            width={140}
            height={40}
          />
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">

          <Link href="/">Home</Link>
          <Link href="/about">About Us</Link>
          <Link href="/contact">Contact</Link>

          {/* Dropdown later bana sakte hai */}
          <Link href="/Forinstitution">For Institution</Link>
          <Link href="/Forstudents">For Students</Link>

        </div>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>

          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Get Started
            </Button>
          </Link>
        </div>

      </nav>
    </header>
  )
}