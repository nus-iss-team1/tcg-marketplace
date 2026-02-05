'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, Search, Plus } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TCG</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Marketplace</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-primary-600 font-medium">
              Browse
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-primary-600 font-medium">
              Categories
            </Link>
            <Link href="/sell" className="btn-primary flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Sell Card</span>
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-primary-600"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Browse
              </Link>
              <Link 
                href="/categories" 
                className="text-gray-700 hover:text-primary-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                href="/sell" 
                className="btn-primary flex items-center space-x-2 w-fit"
                onClick={() => setIsMenuOpen(false)}
              >
                <Plus className="w-4 h-4" />
                <span>Sell Card</span>
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}