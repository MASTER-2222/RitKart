
'use client';
import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrimePage() {
  const [billingType, setBillingType] = useState<'monthly' | 'annual'>('annual');

  const primeFeatures = [
    {
      icon: 'ri-truck-line',
      title: 'Fast, Free Delivery',
      description: 'Unlimited FREE Two-Day delivery on millions of items. Same-Day delivery in select areas.',
      highlight: 'No minimum order amount'
    },
    {
      icon: 'ri-play-circle-line',
      title: 'Prime Video',
      description: 'Watch thousands of popular movies and TV shows, including award-winning Prime Originals.',
      highlight: 'Exclusive content & early releases'
    },
    {
      icon: 'ri-music-line',
      title: 'Prime Music',
      description: 'Listen to 2 million songs ad-free with unlimited skips and offline downloads.',
      highlight: 'Thousands of playlists & stations'
    },
    {
      icon: 'ri-book-line',
      title: 'Prime Reading',
      description: 'Access to over a thousand books, magazines, and comics at no additional cost.',
      highlight: 'Rotate selection monthly'
    },
    {
      icon: 'ri-image-line',
      title: 'Amazon Photos',
      description: 'Unlimited photo storage plus 5GB video storage for Prime members.',
      highlight: 'Share with up to 5 family members'
    },
    {
      icon: 'ri-shopping-bag-3-line',
      title: 'Prime Early Access',
      description: 'Exclusive early access to select Lightning Deals before they open to everyone.',
      highlight: '30 minutes early access'
    },
    {
      icon: 'ri-gamepad-line',
      title: 'Prime Gaming',
      description: 'Free games, exclusive in-game content, and Twitch channel subscription.',
      highlight: 'New games every month'
    },
    {
      icon: 'ri-heart-line',
      title: 'Prescription Savings',
      description: 'Save on prescription medications at participating pharmacies nationwide.',
      highlight: 'Up to 80% savings'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      location: 'New York, NY',
      rating: 5,
      text: 'Prime has completely changed how I shop. The free shipping and Prime Video make it worth every penny!',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Michael Chen',
      location: 'Los Angeles, CA',
      rating: 5,
      text: 'The convenience is unmatched. Same-day delivery has saved me so many times when I needed something urgently.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face'
    },
    {
      name: 'Emily Rodriguez',
      location: 'Chicago, IL',
      rating: 5,
      text: 'Prime Music and Video alone are worth the membership. The shopping benefits are just a bonus!',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face'
    }
  ];

  const faqItems = [
    {
      question: 'How much does Prime membership cost?',
      answer: 'Prime membership costs $12.99/month or $119/year. You can cancel anytime and enjoy a 30-day free trial.'
    },
    {
      question: 'What is included with Prime membership?',
      answer: 'Prime includes free shipping, Prime Video, Prime Music, Prime Reading, Amazon Photos, Prime Gaming, and exclusive deals.'
    },
    {
      question: 'Can I share my Prime membership?',
      answer: 'Yes! You can share select Prime benefits with one other adult and up to four children in your household.'
    },
    {
      question: 'How do I cancel my Prime membership?',
      answer: 'You can cancel your Prime membership anytime in Your Account. If you haven\'t used benefits, you may be eligible for a refund.'
    },
    {
      question: 'Is there a student discount?',
      answer: 'Yes! Prime Student costs just $6.49/month or $59/year and includes the same great benefits.'
    }
  ];

  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="relative mb-8">
        <div 
          className="h-96 bg-cover bg-center relative"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1556742049-0807df4e2031?w=1200&h=400&fit=crop&crop=center)' }}
        >
          <div className="absolute inset-0 bg-blue-900 bg-opacity-75"></div>
          <div className="relative z-10 flex items-center justify-center h-full text-center text-white">
            <div className="max-w-4xl mx-auto px-6">
              <h1 className="text-5xl font-bold mb-4">RitZone Prime</h1>
              <p className="text-2xl mb-8">Fast, free delivery, exclusive deals, and entertainment</p>
              <div className="flex items-center justify-center space-x-4 mb-8">
                <div className="bg-white bg-opacity-20 px-6 py-3 rounded-lg">
                  <div className="text-3xl font-bold">${billingType === 'annual' ? '119' : '12.99'}</div>
                  <div className="text-sm">{billingType === 'annual' ? 'per year' : 'per month'}</div>
                </div>
                <div className="text-lg">
                  {billingType === 'annual' ? 'Save $37 vs monthly' : 'Cancel anytime'}
                </div>
              </div>
              <button className="bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-4 px-8 rounded-lg text-xl whitespace-nowrap">
                Start Your 30-Day Free Trial
              </button>
              <p className="mt-4 text-sm opacity-90">Cancel anytime. No commitments.</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need, all in one membership</h2>
            <p className="text-xl text-gray-600">Join over 200 million Prime members worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {primeFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6 text-center hover:shadow-md transition-shadow">
                <i className={`${feature.icon} w-12 h-12 flex items-center justify-center text-blue-600 mx-auto mb-4 text-4xl`}></i>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{feature.description}</p>
                <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded font-medium">
                  {feature.highlight}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
            <div className="flex justify-center mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-1 flex">
                <button
                  onClick={() => setBillingType('monthly')}
                  className={`px-6 py-2 rounded ${billingType === 'monthly' ? 'bg-white text-blue-600' : 'text-white'}`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingType('annual')}
                  className={`px-6 py-2 rounded ${billingType === 'annual' ? 'bg-white text-blue-600' : 'text-white'}`}
                >
                  Annual
                </button>
              </div>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="bg-white bg-opacity-10 rounded-lg p-6 mb-6">
                <div className="text-4xl font-bold mb-2">
                  ${billingType === 'annual' ? '119' : '12.99'}
                </div>
                <div className="text-lg mb-4">
                  {billingType === 'annual' ? 'per year' : 'per month'}
                </div>
                {billingType === 'annual' && (
                  <div className="bg-yellow-400 text-yellow-900 text-sm px-3 py-1 rounded font-bold mb-4">
                    Save $37 compared to monthly
                  </div>
                )}
                <ul className="text-left space-y-2 text-sm">
                  <li className="flex items-center">
                    <i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Free Two-Day Delivery
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Prime Video & Music
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Exclusive Deals & Early Access
                  </li>
                  <li className="flex items-center">
                    <i className="ri-check-line w-4 h-4 flex items-center justify-center mr-2"></i>
                    Prime Gaming & Reading
                  </li>
                </ul>
              </div>
              <button className="w-full bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-6 rounded-lg text-lg whitespace-nowrap">
                Start Free Trial
              </button>
              <p className="text-sm mt-3 opacity-90">30-day free trial, then ${billingType === 'annual' ? '$119/year' : '$12.99/month'}</p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">What Prime members are saying</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.location}</div>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <i 
                      key={star}
                      className="ri-star-fill w-4 h-4 flex items-center justify-center text-yellow-400"
                    ></i>
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border mb-4">
                <button
                  onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                  className="w-full text-left p-6 font-semibold flex items-center justify-between"
                >
                  {item.question}
                  <i className={`ri-arrow-${openFAQ === index ? 'up' : 'down'}-line w-5 h-5 flex items-center justify-center`}></i>
                </button>
                {openFAQ === index && (
                  <div className="px-6 pb-6 text-gray-700">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <div className="bg-gray-900 rounded-lg p-8 text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to join Prime?</h2>
            <p className="text-xl mb-6">Start your 30-day free trial today</p>
            <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
              <button className="w-full sm:w-auto bg-[#febd69] hover:bg-[#f3a847] text-black font-bold py-3 px-8 rounded-lg text-lg whitespace-nowrap">
                Try Prime Free
              </button>
              <button className="w-full sm:w-auto border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-3 px-8 rounded-lg text-lg whitespace-nowrap">
                Learn More
              </button>
            </div>
            <div className="mt-6 text-sm opacity-75 space-y-1">
              <p>✓ Cancel anytime during trial</p>
              <p>✓ No commitments or hidden fees</p>
              <p>✓ Full access to all Prime benefits</p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
