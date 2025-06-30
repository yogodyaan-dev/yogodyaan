import { useState } from 'react'
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react'
import { Button } from '../UI/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

interface BookingFormProps {
  selectedClass: any
  onComplete: () => void
  onCancel: () => void
}

export function BookingForm({ selectedClass, onComplete, onCancel }: BookingFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    experience: 'beginner',
    specialRequests: '',
    emergencyContact: '',
    emergencyPhone: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<any>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: any = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.emergencyContact.trim()) newErrors.emergencyContact = 'Emergency contact is required'
    if (!formData.emergencyPhone.trim()) newErrors.emergencyPhone = 'Emergency phone is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      const bookingData = {
        user_id: user?.id || null,
        class_name: selectedClass.name,
        instructor: selectedClass.instructor,
        class_time: selectedClass.time,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        experience_level: formData.experience,
        special_requests: formData.specialRequests,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        status: 'confirmed'
      }

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData])

      if (error) {
        throw error
      }

      alert('Booking confirmed! You will receive a confirmation email shortly.')
      onComplete()
    } catch (error: any) {
      setErrors({ general: error.message || 'An error occurred while booking your class.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-8">
      <div className="flex items-center mb-6">
        <button
          onClick={onCancel}
          className="flex items-center text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Classes
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Booking</h1>
        
        {/* Class Summary */}
        <div className="bg-emerald-50 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedClass.name}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <User className="w-4 h-4 mr-2 text-emerald-600" />
              {selectedClass.instructor}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2 text-emerald-600" />
              {selectedClass.time}
            </div>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2 text-emerald-600" />
              {selectedClass.duration}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-emerald-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total:</span>
              <span className="text-2xl font-bold text-emerald-600">{selectedClass.price}</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-600 text-sm">{errors.general}</p>
          </div>
        )}

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
            Yoga Experience Level
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
          </select>
        </div>

        {/* Emergency Contact */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Name *
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.emergencyContact ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyContact && <p className="text-red-500 text-sm mt-1">{errors.emergencyContact}</p>}
            </div>
            <div>
              <label htmlFor="emergencyPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Emergency Contact Phone *
              </label>
              <input
                type="tel"
                id="emergencyPhone"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.emergencyPhone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.emergencyPhone && <p className="text-red-500 text-sm mt-1">{errors.emergencyPhone}</p>}
            </div>
          </div>
        </div>

        {/* Special Requests */}
        <div>
          <label htmlFor="specialRequests" className="block text-sm font-medium text-gray-700 mb-1">
            Special Requests or Health Considerations
          </label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            rows={3}
            value={formData.specialRequests}
            onChange={handleInputChange}
            placeholder="Please let us know about any injuries, health conditions, or special accommodations needed..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : `Confirm Booking - ${selectedClass.price}`}
          </Button>
        </div>
      </form>
    </div>
  )
}