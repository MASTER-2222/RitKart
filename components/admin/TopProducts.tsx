'use client';

export default function TopProducts() {
  const topProducts = [
    {
      name: 'iPhone 15 Pro Max',
      sales: 1247,
      revenue: '$1,547,853',
      image: 'https://readdy.ai/api/search-image?query=iPhone%2015%20Pro%20Max%20smartphone%20sleek%20design%20premium%20technology%20mobile%20device%20clean%20white%20background&width=60&height=60&seq=iphone15pro&orientation=squarish'
    },
    {
      name: 'MacBook Air M2',
      sales: 892,
      revenue: '$1,069,508',
      image: 'https://readdy.ai/api/search-image?query=MacBook%20Air%20M2%20laptop%20computer%20sleek%20aluminum%20design%20premium%20technology%20device%20clean%20white%20background&width=60&height=60&seq=macbookairm2&orientation=squarish'
    },
    {
      name: 'AirPods Pro',
      sales: 1456,
      revenue: '$362,644',
      image: 'https://readdy.ai/api/search-image?query=AirPods%20Pro%20wireless%20earbuds%20premium%20audio%20technology%20white%20design%20clean%20background%20product%20photography&width=60&height=60&seq=airpodspro&orientation=squarish'
    },
    {
      name: 'iPad Pro 11"',
      sales: 634,
      revenue: '$569,766',
      image: 'https://readdy.ai/api/search-image?query=iPad%20Pro%2011%20inch%20tablet%20device%20sleek%20modern%20design%20premium%20technology%20clean%20white%20background%20product%20shot&width=60&height=60&seq=ipadpro11&orientation=squarish'
    },
    {
      name: 'Apple Watch Series 9',
      sales: 1123,
      revenue: '$448,077',
      image: 'https://readdy.ai/api/search-image?query=Apple%20Watch%20Series%209%20smartwatch%20wearable%20technology%20sleek%20design%20premium%20device%20clean%20white%20background&width=60&height=60&seq=watchseries9&orientation=squarish'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        <button className="text-blue-600 hover:text-blue-800 text-sm font-medium whitespace-nowrap">
          View All Products
        </button>
      </div>
      
      <div className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={product.name} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
              {index + 1}
            </div>
            <img 
              src={product.image}
              alt={product.name}
              className="w-12 h-12 object-cover rounded-lg"
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">{product.sales} sales</div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-gray-900">{product.revenue}</div>
              <div className="text-sm text-green-600">Revenue</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}