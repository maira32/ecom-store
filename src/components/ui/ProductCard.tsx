'use client';

import Link from 'next/link';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WishlistButton from '@/components/ui/WishlistButton';

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
}

export default function ProductCard({ id, name, price, imageUrl, category }: ProductCardProps) {
  return (
    <div className="group relative flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">

      <div className="aspect-square w-full overflow-hidden bg-slate-50 relative">

        {imageUrl ? (
  <img
    src={imageUrl}
    alt={`${name} Image`}
    className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
  />
) : (
  <div className="h-full w-full flex items-center justify-center bg-slate-100 text-slate-400">
    No Image
  </div>
)}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

        <div className="absolute top-3 right-3">
          <WishlistButton product={{ id, name, price, imageUrl }} variant="card" />
        </div>
      </div>

      <div className="p-6 flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              {category}
            </p>
            <h3 className="text-lg font-semibold text-slate-900 leading-tight">
              <Link href={`/product/${id}`}>
                <span aria-hidden="true" className="absolute inset-0" />
                {name}
              </Link>
            </h3>
          </div>
          <p className="text-lg font-bold text-slate-900 shrink-0">
            ${price.toFixed(2)}
          </p>
        </div>

        <div className="relative z-10">
          <AddToCartButton product={{ id, name, price }} />
        </div>
      </div>

    </div>
  );
}