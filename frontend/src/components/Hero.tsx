import Link from 'next/link'
import { Search, TrendingUp, Shield, Users } from 'lucide-react'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            Trade Cards with
            <span className="text-primary-600 block">Confidence</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto text-balance">
            Join the premier marketplace for trading card collectors. Buy, sell, and discover 
            rare cards from trusted sellers worldwide.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/browse" className="btn-primary text-lg px-8 py-3">
              Start Browsing
            </Link>
            <Link href="/sell" className="btn-secondary text-lg px-8 py-3">
              Sell Your Cards
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Trading</h3>
            <p className="text-gray-600">
              Safe and secure transactions with buyer and seller protection
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Trusted Community</h3>
            <p className="text-gray-600">
              Connect with verified collectors and traders from around the world
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Market Insights</h3>
            <p className="text-gray-600">
              Real-time pricing and market trends for informed trading decisions
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}