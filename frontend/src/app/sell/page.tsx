import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SellForm from '@/components/SellForm'

export const metadata = {
  title: 'Sell Your Cards - TCG Marketplace',
  description: 'List your trading cards for sale on TCG Marketplace',
}

export default function SellPage() {
  return (
    <>
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              Sell Your Trading Cards
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              List your cards and reach collectors worldwide
            </p>
          </div>
          <SellForm />
        </div>
      </main>
      <Footer />
    </>
  )
}