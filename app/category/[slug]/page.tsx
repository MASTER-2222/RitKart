
import CategoryListing from './CategoryListing';

export async function generateStaticParams() {
  return [
    { slug: 'electronics' },
    { slug: 'fashion' },
    { slug: 'books' },
    { slug: 'home' },
    { slug: 'sports' },
    { slug: 'grocery' },
    { slug: 'appliances' },
    { slug: 'beauty' },
    { slug: 'solar' },
    { slug: 'pharmacy' }
  ];
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryListing categorySlug={params.slug} />;
}
