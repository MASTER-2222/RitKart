'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const helpCategories = [
    {
      icon: 'ri-shopping-cart-line',
      title: 'Orders & Shipping',
      description: 'Track orders, shipping info, delivery options',
      link: '/help/orders'
    },
    {
      icon: 'ri-arrow-go-back-line',
      title: 'Returns & Refunds',
      description: 'Return policy, refund process, exchanges',
      link: '/help/returns'
    },
    {
      icon: 'ri-user-line',
      title: 'Your Account',
      description: 'Account settings, password, personal info',
      link: '/help/account'
    },
    {
      icon: 'ri-credit-card-line',
      title: 'Payment & Billing',
      description: 'Payment methods, billing issues, invoices',
      link: '/help/payment'
    },
    {
      icon: 'ri-vip-crown-line',
      title: 'Prime Membership',
      description: 'Prime benefits, subscription, cancellation',
      link: '/help/prime'
    },
    {
      icon: 'ri-shield-check-line',
      title: 'Security & Privacy',
      description: 'Account security, privacy settings, data protection',
      link: '/help/security'
    }
  ];

  const popularFaqs = [
    {
      question: 'How can I track my order?',
      answer: 'You can track your order by going to "Your Orders" in your account. You\'ll find tracking information and delivery updates there. You can also track orders without signing in using your order number and email.'
    },
    {
      question: 'What is your return policy?',
      answer: 'Most items can be returned within 30 days of delivery. Items must be in original condition and packaging. Some items like perishables, personalized items, and digital downloads cannot be returned.'
    },
    {
      question: 'How do I cancel my Prime membership?',
      answer: 'Go to "Manage Your Prime Membership" in your account settings. You can cancel anytime and will continue to have Prime benefits until your current billing period ends.'
    },
    {
      question: 'Why was my payment declined?',
      answer: 'Payment can be declined for various reasons: insufficient funds, incorrect card details, expired card, or bank security measures. Try updating your payment method or contact your bank.'
    },
    {
      question: 'How do I change my delivery address?',
      answer: 'You can change your delivery address before your order ships by going to "Your Orders" and selecting "Change" next to the shipping address. After shipping, contact customer service.'
    },
    {
      question: 'What are the Prime benefits?',
      answer: 'Prime members get free one-day and two-day shipping, Prime Video access, Prime Music, exclusive deals, and more. Prime benefits vary by location.'
    }
  ];

  const quickActions = [
    {
      icon: 'ri-phone-line',
      title: 'Call Customer Service',
      description: '1-800-RITZONE (1-800-748-9663)',
      action: 'Call Now'
    },
    {
      icon: 'ri-chat-3-line',
      title: 'Start Live Chat',
      description: 'Get instant help from our support team',
      action: 'Chat Now'
    },
    {
      icon: 'ri-mail-line',
      title: 'Email Support',
      description: 'Send us a detailed message',
      action: 'Contact Us'
    }
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to your questions and get the help you need
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for help topics, orders, or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#febd69] focus:border-transparent text-lg"
              />
              <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Need Immediate Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <i className={`${action.icon} text-4xl text-[#febd69] mb-4 block`}></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{action.description}</p>
                <Link 
                  href="/contact" 
                  className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-2 px-4 rounded transition-colors inline-block"
                >
                  {action.action}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Browse Help Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Link 
                key={index} 
                href={category.link}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow group"
              >
                <i className={`${category.icon} text-3xl text-[#febd69] mb-4 block group-hover:scale-110 transition-transform`}></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#febd69] transition-colors">
                  {category.title}
                </h3>
                <p className="text-gray-600 text-sm">{category.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Popular FAQs */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-sm border">
              {popularFaqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-b-0">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <i className={`ri-arrow-${expandedFaq === index ? 'up' : 'down'}-s-line text-gray-400 text-xl transition-transform`}></i>
                    </div>
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section>
          <div className="bg-gradient-to-r from-[#232f3e] to-[#37475a] rounded-lg p-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Can't find what you're looking for? Our customer service team is here to help you 24/7.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-6 rounded-lg transition-colors inline-block"
              >
                <i className="ri-mail-line mr-2"></i>
                Contact Support
              </Link>
              <button className="bg-transparent border-2 border-white hover:bg-white hover:text-[#232f3e] text-white font-bold py-3 px-6 rounded-lg transition-colors">
                <i className="ri-chat-3-line mr-2"></i>
                Live Chat
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
