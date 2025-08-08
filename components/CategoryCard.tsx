
'use client';
import Link from 'next/link';

interface CategoryCardProps {
  title: string;
  image: string;
  href: string;
  subtitle?: string;
}

export default function CategoryCard({ title, image, href, subtitle }: CategoryCardProps) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-lg transition-shadow duration-200 p-4 cursor-pointer h-full">
        <h3 className="text-lg font-bold text-gray-900 mb-3">{title}</h3>
        <div className="relative mb-3">
          <img 
            src={image}
            alt={title}
            className="w-full h-40 object-cover rounded"
          />
        </div>
        {subtitle && (
          <p className="text-sm text-gray-600">{subtitle}</p>
        )}
        <div className="mt-3 text-blue-600 text-sm hover:underline">
          Shop now
        </div>
      </div>
    </Link>
  );
}
