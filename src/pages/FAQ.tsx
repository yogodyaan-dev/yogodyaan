import { useState } from 'react'
import { ChevronDown, ChevronUp, Search } from 'lucide-react'

export function FAQ() {
  const [searchTerm, setSearchTerm] = useState('')
  const [openItems, setOpenItems] = useState<number[]>([])

  const faqData = [
    {
      category: "Getting Started",
      questions: [
        {
          question: "Do I need to be flexible to start yoga?",
          answer: "Not at all! Flexibility is a result of yoga practice, not a prerequisite. Our beginner classes are designed to help you build flexibility gradually and safely. Everyone starts somewhere, and our instructors will help you modify poses to suit your current ability level."
        },
        {
          question: "What should I wear to class?",
          answer: "Wear comfortable, stretchy clothing that allows you to move freely. Avoid loose clothing that might get in the way during poses. Most students wear leggings or shorts with a fitted top. You'll practice barefoot, so no special shoes are needed."
        },
        {
          question: "Do I need to bring my own yoga mat?",
          answer: "We provide high-quality yoga mats and all necessary props (blocks, straps, bolsters) for all our classes. However, you're welcome to bring your own mat if you prefer. We clean and sanitize all equipment after each use."
        },
        {
          question: "What if I can't do a pose?",
          answer: "That's completely normal! Our instructors always provide modifications and alternatives for every pose. Yoga is about working with your body, not against it. Listen to your body and never force a pose that doesn't feel right."
        }
      ]
    },
    {
      category: "Classes & Scheduling",
      questions: [
        {
          question: "How do I book a class?",
          answer: "You can book classes through our website by visiting the 'Book Class' page. Select your preferred class, fill out the booking form, and complete payment. You'll receive a confirmation email with all the details."
        },
        {
          question: "What's your cancellation policy?",
          answer: "You can cancel your booking up to 2 hours before the class start time for a full refund. Cancellations made less than 2 hours before class will receive a credit that can be used for future classes within 30 days."
        },
        {
          question: "Can I drop in without booking?",
          answer: "While we recommend booking in advance to guarantee your spot, we do accept drop-ins if space is available. However, popular classes often fill up, so booking ahead is your best bet to secure a spot."
        },
        {
          question: "How early should I arrive for class?",
          answer: "We recommend arriving 10-15 minutes before your first class for a brief orientation and to get settled. For regular classes, arriving 5-10 minutes early is perfect to set up your space and center yourself before we begin."
        }
      ]
    },
    {
      category: "Health & Safety",
      questions: [
        {
          question: "Is yoga safe during pregnancy?",
          answer: "Yoga can be very beneficial during pregnancy, but it's important to practice safely. We offer prenatal yoga classes specifically designed for expecting mothers. Always consult with your healthcare provider before starting any exercise program during pregnancy."
        },
        {
          question: "I have an injury. Can I still practice yoga?",
          answer: "Yoga can often help with injury recovery, but it's crucial to practice safely. Please inform your instructor about any injuries or health conditions before class. They can provide modifications and alternatives to ensure your practice is safe and beneficial."
        },
        {
          question: "What if I have high blood pressure or other health conditions?",
          answer: "Many people with various health conditions benefit from yoga practice. However, it's important to consult with your healthcare provider first and inform your instructor about any conditions. We can modify poses and provide alternatives as needed."
        }
      ]
    },
    {
      category: "Membership & Pricing",
      questions: [
        {
          question: "Do you offer membership packages?",
          answer: "Yes! We offer various membership options including monthly unlimited passes, class packages, and drop-in rates. Our membership packages provide the best value for regular practitioners. Contact us for current pricing and package details."
        },
        {
          question: "Is there a discount for students or seniors?",
          answer: "Yes, we offer a 15% discount for full-time students (with valid ID) and seniors (65+). We also have a sliding scale program for those who need financial assistance. We believe yoga should be accessible to everyone."
        },
        {
          question: "What payment methods do you accept?",
          answer: "We accept all major credit cards, debit cards, and cash. Online bookings can be paid with credit/debit cards. We also offer automatic payment options for monthly memberships."
        }
      ]
    }
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(item => item !== index)
        : [...prev, index]
    )
  }

  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      item => 
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl text-emerald-100">
            Find answers to common questions about our yoga classes, policies, and practices. 
            Can't find what you're looking for? Feel free to ask us directly!
          </p>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No questions found matching your search. Try different keywords or 
                <a href="/yoga-query" className="text-emerald-600 hover:text-emerald-700 ml-1">
                  ask us directly
                </a>
                .
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredFAQ.map((category, categoryIndex) => (
                <div key={categoryIndex}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{category.category}</h2>
                  <div className="space-y-4">
                    {category.questions.map((item, itemIndex) => {
                      const globalIndex = categoryIndex * 100 + itemIndex
                      const isOpen = openItems.includes(globalIndex)
                      
                      return (
                        <div key={itemIndex} className="card overflow-hidden">
                          <button
                            onClick={() => toggleItem(globalIndex)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <h3 className="text-lg font-semibold text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                            )}
                          </button>
                          {isOpen && (
                            <div className="px-6 pb-4">
                              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our experienced instructors are here to help. Don't hesitate to reach out!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/yoga-query"
              className="btn-primary inline-flex items-center justify-center"
            >
              Ask a Question
            </a>
            <a
              href="/contact"
              className="btn-secondary inline-flex items-center justify-center"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}