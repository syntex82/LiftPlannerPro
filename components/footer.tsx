import Link from "next/link"
import Image from "next/image"
import { Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <Image src="/company-logo.png" alt="Lift Planner Pro Logo" width={40} height={40} className="rounded-lg" />
              <div>
                <div className="text-white font-bold text-xl">Lift Planner Pro</div>
                <div className="text-slate-400 text-sm">Professional Lifting & Rigging CAD Software</div>
              </div>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              Professional CAD software for lift planning with advanced tools for safe and efficient lifting operations.
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-slate-300">
                <Mail className="w-4 h-4 mr-2" />
                support@liftplannerpro.co.uk
              </div>
              <div className="flex items-center text-slate-300">
                <MapPin className="w-4 h-4 mr-2" />
                liftplannerpro.co.uk
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#features" className="text-slate-300 hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="#pricing" className="text-slate-300 hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#screenshots" className="text-slate-300 hover:text-white transition-colors">
                  Screenshots
                </Link>
              </li>
              <li>
                <Link href="/download" className="text-slate-300 hover:text-white transition-colors">
                  Download
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-slate-300 hover:text-white transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/documentation" className="text-slate-300 hover:text-white transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/tutorials" className="text-slate-300 hover:text-white transition-colors">
                  Tutorials
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-300 hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <div className="text-slate-400 text-sm mb-4 sm:mb-0">
            © {new Date().getFullYear()} Lift Planner Pro. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy" className="text-slate-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-slate-400 hover:text-white text-sm transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="text-slate-400 hover:text-white text-sm transition-colors">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
