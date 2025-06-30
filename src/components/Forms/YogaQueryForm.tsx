import { useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { Button } from '../UI/Button'
import { supabase } from '../../lib/supabase'

export function YogaQueryForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    experience: 'beginner'
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const categories = [
    { value: 'general', label: 'General Question' },
    { value: 'classes', label: 'About Classes' },
    { value: 'poses', label: 'Yoga Poses & Techniques' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'membership', label: 'Membership & Pricing' },
    { value: 'schedule', label: 'Schedule & Booking' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required'
    if (!formData.message.trim()) newErrors.message = 'Message is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      const queryData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        category: formData.category,
        message: formData.message,
        experience_level: formData.experience,
        status: 'pending'
      }

      const { error } = await supabase
        .from('yoga_queries')
        .insert([queryData])

      if (error) {
        throw error
      }

      setSubmitted(true)
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred while submitting your question.' })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="card p-8 text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageCircle className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
        <p className="text-gray-600 mb-6">
          Your question has been submitted successfully. One of our experienced instructors 
          will get back to you within 24 hours.
        </p>
        <Button onClick={() => {
          setSubmitted(false)
          setFormData({
            name: '',
            email: '',
            subject: '',
            category: 'general',
            message: '',
            experience: 'beginner'
          })
        }}>
          Ask Another Question
        </Button>
      </div>
    )
  }

  return (
    <div className="card p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit Your Question</h2>
        <p className="text-gray-600">
          Whether you're curious about specific poses, need guidance on your practice, 
          or have questions about our classes, we're here to help!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>

        {/* Question Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
              Question Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
              Your Yoga Experience
            </label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="beginner">Beginner (0-6 months)</option>
              <option value="intermediate">Intermediate (6 months - 2 years)</option>
              <option value="advanced">Advanced (2+ years)</option>
              <option value="instructor">Instructor/Teacher</option>
            </select>
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Brief description of your question..."
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.subject ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Your Question *
          </label>
          <textarea
            id="message"
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Please provide as much detail as possible about your question. The more information you share, the better we can help you!"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
              errors.message ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
          <p className="text-sm text-gray-500 mt-1">
            {formData.message.length}/500 characters
          </p>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={loading}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              'Sending...'
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Question
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
        <p className="text-sm text-emerald-800">
          <strong>Response Time:</strong> We typically respond to questions within 24 hours. 
          For urgent matters, please call us at (555) 123-4567.
        </p>
      </div>
    </div>
  )
}