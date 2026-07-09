'use client';

import { useEffect, useState } from 'react';
import ProductCard from "@/components/ui/ProductCard";
import { Loader2 } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string;
  category: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        if (productsData.success) setAllProducts(productsData.data);
        if (categoriesData.success) setCategories(categoriesData.data);
      } catch (err) {
        console.error('Failed to load storefront data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts =
    selectedCategory === 'All'
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">

      <div className="flex flex-col md:flex-row gap-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Categories</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedCategory('All')}
                className={`text-sm font-medium transition-colors ${
                  selectedCategory === 'All'
                    ? 'text-slate-900 font-bold underline'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
            </li>
            {categories.map((cat) => (
              <li key={cat._id}>
                <button
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`text-sm font-medium transition-colors ${
                    selectedCategory === cat.name
                      ? 'text-slate-900 font-bold underline'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <span className="text-sm text-slate-900 font-medium">{filteredProducts.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product._id}
                id={product._id}
                name={product.name}
                price={product.price}
                imageUrl={product.imageUrl || ''}
                category={product.category}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <p className="text-center text-slate-500 py-16">No products found in this category.</p>
          )}
        </div>
      </div>

    </div>
  );
}