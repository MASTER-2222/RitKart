
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

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryListing categorySlug={slug} />;
}
