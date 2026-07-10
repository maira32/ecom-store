import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductCard from "@/components/ui/ProductCard";
import PaginationControls from "@/components/ui/PaginationControls";

interface HomeProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  await connectDB();

  const resolvedParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedParams.page || '1', 10) || 1);
  const limit = [10, 20, 30].includes(Number(resolvedParams.limit))
    ? Number(resolvedParams.limit)
    : 10;

  const totalCount = await Product.countDocuments();
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const safePage = Math.min(currentPage, totalPages);
  const skip = (safePage - 1) * limit;

  const products = await Product.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
      
      <div className="mb-24 flex flex-col items-center text-center">
        <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
          Curated for clarity.
        </h1>
        <p className="max-w-2xl text-lg text-slate-900">
          A collection of intentionally designed essentials to elevate your everyday environment. Minimalist form, maximum function.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-slate-500">No products found. Please add some from the Admin Dashboard.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
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

          <PaginationControls currentPage={safePage} totalPages={totalPages} limit={limit} />
        </>
      )}
      
    </div>
  );
}