import Link from 'next/link';

interface ProductProps {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export default function ProductCard({ id, name, price, category }: ProductProps) {
  return (
    <Link href={`/product/${id}`} className="group flex flex-col gap-y-3">
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-slate-50 transition-all duration-300 group-hover:bg-slate-100 group-hover:shadow-md border border-slate-100">
        <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-sm font-medium tracking-wide transition-transform duration-500 group-hover:scale-105">
          {name} Image
        </div>
      </div>
      
      <div className="flex flex-col gap-y-1 px-1">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
          {category}
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-slate-600">
            {name}
          </h3>
          <p className="text-base font-medium text-slate-900">
            ${price.toFixed(2)}
          </p>
        </div>
      </div>
    </Link>
  );
}