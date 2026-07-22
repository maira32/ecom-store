import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Review from '@/models/Review';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WishlistButton from '@/components/ui/WishlistButton';
import ProductGallery from '@/components/ui/ProductGallery';
import ProductCard from '@/components/ui/ProductCard';
import ReviewsSection from '@/components/ui/ReviewsSection';

export default async function ProductDetails({ params }: { params: Promise<{ id: string }> }) {
  await connectDB();

  const resolvedParams = await params;
  const productId = resolvedParams.id;

  if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
    notFound(); 
  }

  const product = await Product.findById(productId);

  if (!product) {
    notFound();
  }

  const fallbackImage = `https://picsum.photos/seed/${product.name.replace(/\s+/g, '')}/600/600`;
  const galleryImages = product.images?.length
    ? product.images
    : product.imageUrl
    ? [product.imageUrl]
    : [fallbackImage];

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  const reviewsRaw = await Review.find({ product: product._id }).sort({ createdAt: -1 }).lean();
  const reviews = reviewsRaw.map((r: any) => ({
    _id: r._id.toString(),
    user: r.user.toString(),
    userName: r.userName,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const session = await getServerSession(authOptions);
  let canReview = false;
  if (session && (session.user as any).role !== 'admin') {
    const eligibleOrder = await Order.findOne({
      user: (session.user as any).id,
      status: 'completed',
      'items.product': product._id,
    });
    canReview = !!eligibleOrder;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">

        <ProductGallery images={galleryImages} alt={product.name} />

        <div className="flex flex-col justify-center">
          <nav className="text-sm text-slate-500 mb-6 flex gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-slate-900 transition-colors">{product.category}</Link>
          </nav>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            {product.name}
          </h1>

          {reviews.length > 0 && (
            <a href="#reviews" className="inline-flex items-center gap-2 mb-6 hover:opacity-75 transition-opacity">
              <span className="text-amber-400 text-sm">
                {'★'.repeat(Math.round(avgRating))}{'☆'.repeat(5 - Math.round(avgRating))}
              </span>
              <span className="text-sm text-slate-500">
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
              </span>
            </a>
          )}

          <p className="text-2xl font-medium text-slate-900 mb-8">
            ${product.price.toFixed(2)}
          </p>
          
          <p className="text-slate-600 leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="flex gap-4 mt-8">
            <AddToCartButton 
              product={{ 
                id: product._id.toString(), 
                name: product.name, 
                price: product.price 
              }} 
            />
            <WishlistButton
              product={{
                id: product._id.toString(),
                name: product.name,
                price: product.price,
                imageUrl: galleryImages[0],
              }}
              variant="detail"
            />
          </div>
        </div>

      </div>

       <div id="reviews">
        <ReviewsSection productId={product._id.toString()} initialReviews={reviews} canReview={canReview} />
      </div>

      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-16 border-t border-slate-100">
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-8">
            You Might Also Like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            {relatedProducts.map((related) => (
              <ProductCard
                key={related._id.toString()}
                id={related._id.toString()}
                name={related.name}
                price={related.price}
                imageUrl={related.images?.[0] || related.imageUrl || `https://picsum.photos/seed/${related.name.replace(/\s+/g, '')}/600/600`}
                category={related.category}
              />
            ))}
          </div>
        </div>
      )}

     
    </div>
  );
}