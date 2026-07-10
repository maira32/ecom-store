import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WishlistButton from '@/components/ui/WishlistButton';

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        
        <div className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
          <img 
            src={product.imageUrl || `https://picsum.photos/seed/${product.name.replace(/\s+/g, '')}/600/600`}
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-col justify-center">
          <nav className="text-sm text-slate-500 mb-6 flex gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/categories" className="hover:text-slate-900 transition-colors">{product.category}</Link>
          </nav>

          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {product.name}
          </h1>
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
                imageUrl: product.imageUrl,
              }}
              variant="detail"
            />
          </div>
        </div>

      </div>
    </div>
  );
}