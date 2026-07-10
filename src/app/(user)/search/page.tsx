import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductCard from '@/components/ui/ProductCard';
import { SearchX } from 'lucide-react';

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = (q || '').trim();

  let products: any[] = [];

  if (query) {
    await connectDB();
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    products = await Product.find({
      $or: [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { category: { $regex: escaped, $options: 'i' } },
      ],
    }).sort({ createdAt: -1 });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {query ? `Results for "${query}"` : 'Search'}
        </h1>
        {query && (
          <p className="text-sm text-slate-600 mt-1">{products.length} items found</p>
        )}
      </div>

      {!query ? (
        <p className="text-slate-500">Type something in the search bar to find products.</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="inline-flex bg-white rounded-full p-3 mb-4 border border-slate-200">
            <SearchX className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-700 font-medium">No products match "{query}"</p>
          <p className="text-sm text-slate-500 mt-1">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product._id.toString()}
              id={product._id.toString()}
              name={product.name}
              price={product.price}
              imageUrl={product.imageUrl || `https://picsum.photos/seed/${product.name.replace(/\s+/g, '')}/600/600`}
              category={product.category}
            />
          ))}
        </div>
      )}
    </div>
  );
}