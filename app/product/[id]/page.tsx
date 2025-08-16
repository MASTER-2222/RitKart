
import ProductDetail from './ProductDetail';

// Remove static generation for production - use dynamic rendering
// This allows all products to work with UUID-based IDs from production backend
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
