import { Suspense } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ListingsGrid from '@/components/ListingsGrid'
import Footer from '@/components/Footer'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero />
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                Featured Trading Cards
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                Discover rare and valuable trading cards from collectors worldwide
              </p>
            </div>
            <Suspense fallback={<LoadingSpinner />}>
              <ListingsGrid />
            </Suspense>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}