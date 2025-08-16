
'use client';
import Link from 'next/link';
import { useCurrency, Currency } from '../contexts/CurrencyContext';

export default function Footer() {
  const { selectedCurrency, currencies, setCurrency, isLoading } = useCurrency();

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const currencyCode = e.target.value;
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    if (selectedCurrency) {
      setCurrency(selectedCurrency);
    }
  };

  return (
    <footer className="bg-[#232f3e] text-white">
      <div className="bg-[#37475a] text-center py-4">
        <button className="text-white hover:underline text-sm">
          Back to top
        </button>
      </div>
      
      <div className="px-8 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-white mb-4">Get to Know Us</h3>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-gray-300 hover:underline">Careers</Link>
                <Link href="/blog" className="block text-gray-300 hover:underline">Blog</Link>
                <Link href="/about" className="block text-gray-300 hover:underline">About RitZone</Link>
                <Link href="/investor" className="block text-gray-300 hover:underline">Investor Relations</Link>
                <Link href="/devices" className="block text-gray-300 hover:underline">RitZone Devices</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Make Money with Us</h3>
              <div className="space-y-2 text-sm">
                <Link href="/sell" className="block text-gray-300 hover:underline">Sell products on RitZone</Link>
                <Link href="/business" className="block text-gray-300 hover:underline">Sell on RitZone Business</Link>
                <Link href="/apps" className="block text-gray-300 hover:underline">Sell apps on RitZone</Link>
                <Link href="/affiliate" className="block text-gray-300 hover:underline">Become an Affiliate</Link>
                <Link href="/advertise" className="block text-gray-300 hover:underline">Advertise Your Products</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">RitZone Payment Products</h3>
              <div className="space-y-2 text-sm">
                <Link href="/business-card" className="block text-gray-300 hover:underline">RitZone Business Card</Link>
                <Link href="/rewards" className="block text-gray-300 hover:underline">Shop with Points</Link>
                <Link href="/reload" className="block text-gray-300 hover:underline">Reload Your Balance</Link>
                <Link href="/currency" className="block text-gray-300 hover:underline">RitZone Currency Converter</Link>
              </div>
            </div>
            
            <div>
              <h3 className="font-bold text-white mb-4">Let Us Help You</h3>
              <div className="space-y-2 text-sm">
                <Link href="/orders" className="block text-gray-300 hover:underline">Your Orders</Link>
                <Link href="/shipping" className="block text-gray-300 hover:underline">Shipping Rates & Policies</Link>
                <Link href="/returns" className="block text-gray-300 hover:underline">Returns & Replacements</Link>
                <Link href="/content" className="block text-gray-300 hover:underline">Manage Your Content and Devices</Link>
                <Link href="/contact" className="block text-gray-300 hover:underline">Contact Us</Link>
                <Link href="/help" className="block text-gray-300 hover:underline">Help</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-600 px-8 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-['Pacifico'] text-white">RitZone</span>
            </Link>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm">
              {/* Language Selector */}
              <div className="flex items-center space-x-2">
                <i className="ri-global-line w-4 h-4 text-gray-300"></i>
                <select 
                  className="bg-[#37475a] border border-gray-500 text-white px-4 py-2 rounded hover:bg-[#485769] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[120px]"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                </select>
              </div>
              
              {/* Currency Selector */}
              <div className="flex items-center space-x-2">
                <i className="ri-money-dollar-circle-line w-4 h-4 text-gray-300"></i>
                <select 
                  className="bg-[#37475a] border border-gray-500 text-white px-4 py-2 rounded hover:bg-[#485769] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[160px]"
                  value={selectedCurrency.code}
                  onChange={handleCurrencyChange}
                  disabled={isLoading}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.flag} {currency.symbol} {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Country Selector */}
              <div className="flex items-center space-x-2">
                <i className="ri-earth-line w-4 h-4 text-gray-300"></i>
                <select 
                  className="bg-[#37475a] border border-gray-500 text-white px-4 py-2 rounded hover:bg-[#485769] focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer min-w-[160px]"
                  value={selectedCurrency.country.toLowerCase().replace(' ', '')}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.country.toLowerCase().replace(' ', '')}>
                      {currency.flag} {currency.country}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-[#131a22] px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-7 gap-4 text-xs text-gray-400">
            <div className="space-y-2">
              <Link href="/conditions" className="block hover:underline">Conditions of Use</Link>
              <Link href="/privacy" className="block hover:underline">Privacy Notice</Link>
            </div>
            <div className="space-y-2">
              <Link href="/ads" className="block hover:underline">Interest-Based Ads</Link>
              <Link href="/cookies" className="block hover:underline">Cookies</Link>
            </div>
            <div className="space-y-2">
              <Link href="/careers" className="block hover:underline">Careers</Link>
              <Link href="/press" className="block hover:underline">Press Center</Link>
            </div>
            <div className="space-y-2">
              <Link href="/business" className="block hover:underline">Business</Link>
              <Link href="/logistics" className="block hover:underline">Logistics</Link>
            </div>
            <div className="space-y-2">
              <Link href="/music" className="block hover:underline">RitZone Music</Link>
              <Link href="/video" className="block hover:underline">RitZone Video</Link>
            </div>
            <div className="space-y-2">
              <Link href="/fresh" className="block text-gray-300 hover:underline">RitZone Fresh</Link>
              <Link href="/pharmacy" className="block text-gray-300 hover:underline">RitZone Pharmacy</Link>
            </div>
            <div className="space-y-2">
              <Link href="/whole-foods" className="block hover:underline">Whole Foods Market</Link>
              <Link href="/warehouse" className="block hover:underline">RitZone Warehouse</Link>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700 text-center">
            <div className="flex flex-col md:flex-row items-center justify-center space-y-2 md:space-y-0 md:space-x-4 text-xs text-gray-400">
              <span>© 2024, RitZone.com, Inc. or its affiliates</span>
              <span className="hidden md:inline">|</span>
              <span>Current Currency: <strong className="text-orange-400">{selectedCurrency.flag} {selectedCurrency.symbol} {selectedCurrency.code}</strong></span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
