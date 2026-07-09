import { ShoppingCart, Heart } from 'lucide-react';
import Link from 'next/link';
import AddToCartButton from '@/components/ui/AddToCartButton';
import WishlistButton from '@/components/ui/WishlistButton';

export default function ProductDetails({ params }: { params: { id: string } }) {
  const product = {
    id: params.id,
    name: "Matte Black Watch",
    price: 120.00,
    description: "A masterclass in minimalist design. Featuring a sandblasted stainless steel case, a stark black dial with no indices, and a premium leather strap. Water-resistant up to 50 meters. Designed for those who value understated elegance.",
    category: "Accessories",
    features: ["40mm Case", "Sapphire Crystal", "Swiss Movement", "Genuine Leather"],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        
        <div className="aspect-square bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
          <span className="text-slate-700 font-medium">Product Image Placeholder</span>
        </div>

        <div className="flex flex-col justify-center">
          <nav className="text-sm text-slate-700 mb-6 flex gap-2">
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
          
          <p className="text-slate-900 leading-relaxed mb-8">
            {product.description}
          </p>

          <ul className="mb-10 space-y-2">
            {product.features.map((feature, idx) => (
              <li key={idx} className="flex items-center text-slate-900">
                <span className="w-1.5 h-1.5 bg-slate-900 rounded-full mr-3"></span>
                {feature}
              </li>
            ))}
          </ul>

         <div className="flex gap-4">
            <AddToCartButton product={{ id: product.id, name: product.name, price: product.price }} />
            <WishlistButton product={{ id: product.id, name: product.name, price: product.price }} />
          </div>
        </div>

      </div>
    </div>
  );
}