'use client'

import { useState } from 'react'
import { Upload, X, DollarSign, Tag, FileText, Image as ImageIcon } from 'lucide-react'

interface FormData {
  title: string
  description: string
  price: string
  category: string
  images: File[]
}

export default function SellForm() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    images: []
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'vintage', label: 'Vintage' },
    { value: 'modern', label: 'Modern' },
    { value: 'sealed', label: 'Sealed Products' },
    { value: 'singles', label: 'Singles' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({ ...prev, images: [...prev.images, ...files].slice(0, 5) }))
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
      
      // Create listing
      const listingData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        images: [] // Will be populated after image uploads
      }

      const response = await fetch(`${apiUrl}/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(listingData)
      })

      if (!response.ok) {
        throw new Error('Failed to create listing')
      }

      const listing = await response.json()
      
      // TODO: Upload images using presigned URLs
      // For now, we'll just show success
      
      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        images: []
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Listing Created!</h3>
        <p className="text-gray-600 mb-6">Your trading card has been listed successfully.</p>
        <button 
          onClick={() => setSuccess(false)}
          className="btn-primary"
        >
          Create Another Listing
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="label">
            <Tag className="w-4 h-4 inline mr-2" />
            Card Title *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="input-field"
            placeholder="e.g., Black Lotus - Alpha"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="label">
            <FileText className="w-4 h-4 inline mr-2" />
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="input-field"
            placeholder="Describe the condition, rarity, and any special features..."
          />
        </div>

        {/* Price and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="price" className="label">
              <DollarSign className="w-4 h-4 inline mr-2" />
              Price (USD) *
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="input-field"
              placeholder="0.00"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-field"
              required
            >
              <option value="">Select a category</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="label">
            <ImageIcon className="w-4 h-4 inline mr-2" />
            Images (up to 5)
          </label>
          
          <div className="mt-2">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
            </label>
          </div>

          {/* Image Preview */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
              {formData.images.map((file, index) => (
                <div key={index} className="relative">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-lg py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </div>
    </form>
  )
}