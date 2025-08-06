'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    category: 'general',
    message: '',
    orderNumber: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          category: 'general',
          message: '',
          orderNumber: ''
        });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactMethods = [
    {
      icon: 'ri-phone-line',
      title: 'Call Us',
      description: 'Speak with our customer service team',
      contact: '1-800-RITZONE (1-800-748-9663)',
      hours: 'Mon-Fri: 8AM-8PM EST, Sat-Sun: 9AM-6PM EST'
    },
    {
      icon: 'ri-chat-3-line',
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      contact: 'Available 24/7',
      hours: 'Average response time: 2 minutes'
    },
    {
      icon: 'ri-mail-line',
      title: 'Email Support',
      description: 'Send us a detailed message',
      contact: 'support@ritzone.com',
      hours: 'Response within 24 hours'
    },
    {
      icon: 'ri-map-pin-line',
      title: 'Visit Us',
      description: 'Come to our headquarters',
      contact: '123 Commerce Street, New York, NY 10001',
      hours: 'Mon-Fri: 9AM-5PM EST'
    }
  ];

  const faqCategories = [
    {
      title: 'Orders & Shipping',
      questions: [
        'How can I track my order?',
        'What are your shipping options?',
        'Can I change my delivery address?',
        'What if my package is damaged?'
      ]
    },
    {
      title: 'Returns & Refunds',
      questions: [
        'How do I return an item?',
        'What is your return policy?',
        'When will I receive my refund?',
        'Can I exchange an item?'
      ]
    },
    {
      title: 'Account & Prime',
      questions: [
        'How do I reset my password?',
        'What are Prime benefits?',
        'How do I cancel Prime?',
        'Can I share my Prime account?'
      ]
    },
    {
      title: 'Payment & Billing',
      questions: [
        'What payment methods do you accept?',
        'How do I update my payment info?',
        'Why was my payment declined?',
        'Can I use multiple payment methods?'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help! Get in touch with our customer service team for any questions, 
            concerns, or feedback about your RitZone experience.
          </p>
        </div>

        {/* Contact Methods Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">How Can We Help You?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                <i className={`${method.icon} text-4xl text-[#febd69] mb-4 block`}></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <p className="font-medium text-gray-900 mb-2">{method.contact}</p>
                <p className="text-xs text-gray-500">{method.hours}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <i className="ri-check-circle-line text-green-600 text-xl mr-3"></i>
                    <div>
                      <h3 className="text-green-800 font-semibold">Message Sent Successfully!</h3>
                      <p className="text-green-700 text-sm">We'll get back to you within 24 hours.</p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <i className="ri-error-warning-line text-red-600 text-xl mr-3"></i>
                    <div>
                      <h3 className="text-red-800 font-semibold">Error Sending Message</h3>
                      <p className="text-red-700 text-sm">Please try again or contact us directly.</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="technical">Technical Issue</option>
                      <option value="billing">Billing Question</option>
                      <option value="returns">Returns & Refunds</option>
                      <option value="prime">Prime Membership</option>
                      <option value="seller">Seller Support</option>
                      <option value="feedback">Feedback & Suggestions</option>
                    </select>
                  </div>
                </div>

                {formData.category === 'order' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Order Number
                    </label>
                    <input
                      type="text"
                      name="orderNumber"
                      value={formData.orderNumber}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                      placeholder="e.g., 123-4567890-1234567"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent resize-vertical"
                    placeholder="Please provide as much detail as possible to help us assist you better..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#febd69] hover:bg-[#f3a847] disabled:bg-gray-300 disabled:cursor-not-allowed text-black font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sending Message...
                    </>
                  ) : (
                    <>
                      <i className="ri-send-plane-line mr-2"></i>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </section>

          {/* FAQ Section */}
          <section>
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-6">
                {faqCategories.map((category, index) => (
                  <div key={index}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <i className="ri-question-line text-[#febd69] mr-2"></i>
                      {category.title}
                    </h3>
                    <ul className="space-y-2 ml-6">
                      {category.questions.map((question, qIndex) => (
                        <li key={qIndex} className="text-gray-600 hover:text-[#febd69] cursor-pointer transition-colors">
                          • {question}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Can't find what you're looking for?</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Visit our comprehensive Help Center for detailed guides and troubleshooting.
                </p>
                <button className="bg-[#232f3e] hover:bg-[#37475a] text-white px-4 py-2 rounded text-sm transition-colors">
                  Visit Help Center
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Additional Support Section */}
        <section className="mt-16">
          <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              For urgent matters or if you need immediate help with your order, 
              our customer service team is available 24/7 through multiple channels.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-6 rounded-lg transition-colors">
                <i className="ri-phone-line mr-2"></i>
                Call Now: 1-800-RITZONE
              </button>
              <button className="bg-transparent border-2 border-white hover:bg-white hover:text-[#232f3e] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                <i className="ri-chat-3-line mr-2"></i>
                Start Live Chat
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
