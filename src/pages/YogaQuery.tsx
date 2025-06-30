import { YogaQueryForm } from '../components/Forms/YogaQueryForm'

export function YogaQuery() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-6">Ask Your Yoga Questions</h1>
          <p className="text-xl text-emerald-100">
            Have questions about yoga, our classes, or your practice? Our experienced instructors 
            are here to help guide you on your wellness journey.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <YogaQueryForm />
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Common Questions</h2>
            <p className="text-gray-600">
              Here are some frequently asked questions that might help you get started.
            </p>
          </div>
          
          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Do I need to be flexible to start yoga?
              </h3>
              <p className="text-gray-600">
                Not at all! Flexibility is a result of yoga practice, not a prerequisite. 
                Our beginner classes are designed to help you build flexibility gradually and safely.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What should I wear to class?
              </h3>
              <p className="text-gray-600">
                Wear comfortable, stretchy clothing that allows you to move freely. 
                Avoid loose clothing that might get in the way during poses.
              </p>
            </div>
            
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How often should I practice yoga?
              </h3>
              <p className="text-gray-600">
                Even once a week can be beneficial! For best results, we recommend 2-3 times per week. 
                Listen to your body and build up gradually.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}