'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Heart, Eye } from 'lucide-react'

interface Listing {
  id: string
  title: string
  description?: string
  price: number
  category: string
  images: string[]
  created_at: string
  status: string
}

export default function ListingsGrid() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    try {
      // Force rebuild - using /api as default for ALB path-based routing
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      console.log('API URL:', apiUrl) // Debug log
      const response = await fetch(`${apiUrl}/listings?category=vintage&limit=12`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch listings')
      }
      
      const data = await response.json()
      setListings(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listings')
      // Show sample data for demo purposes
      setListings(getSampleListings())
    } finally {
      setLoading(false)
    }
  }

  const getSampleListings = (): Listing[] => [
    {
      id: '1',
      title: 'Black Lotus - Alpha',
      description: 'Near mint condition, professionally graded',
      price: 15000,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '2',
      title: 'Charizard Base Set',
      description: 'First edition, excellent condition',
      price: 2500,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '3',
      title: 'Blue-Eyes White Dragon',
      description: 'LOB-001, mint condition',
      price: 800,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '4',
      title: 'Time Walk - Beta',
      description: 'Light play condition',
      price: 3200,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '5',
      title: 'Pikachu Illustrator',
      description: 'Japanese promo card, PSA 9',
      price: 12000,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    },
    {
      id: '6',
      title: 'Mox Ruby - Alpha',
      description: 'Near mint, no visible wear',
      price: 4500,
      category: 'vintage',
      images: ['/placeholder-card.jpg'],
      created_at: new Date().toISOString(),
      status: 'active'
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="card animate-pulse">
            <div className="aspect-[3/4] bg-gray-200"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded mb-4 w-2/3"></div>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error && listings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Unable to load listings</p>
        <button 
          onClick={fetchListings}
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800 text-sm">
            Showing sample data. Backend connection: {error}
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="card group cursor-pointer">
            <div className="relative aspect-[3/4] bg-gray-100">
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              {/* Placeholder for card image */}
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/80 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <span className="text-2xl">🃏</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Trading Card</p>
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                {listing.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {listing.description || 'No description available'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-primary-600">
                  {formatPrice(listing.price)}
                </span>
                <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                  {listing.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {listings.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">No listings found</p>
          <button 
            onClick={fetchListings}
            className="btn-primary"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  )
}