'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCard from "@/components/ui/ProductCard";
import { Loader2, ChevronDown } from 'lucide-react';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProducts =
    selectedCategory === 'All'
      ? allProducts
      : allProducts.filter((p) => p.category === selectedCategory);

  const allOptions = ['All', ...categories.map((c) => c.name)];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-16">

      <div className="md:hidden mb-8 relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-900 font-medium"
        >
          {selectedCategory}
          <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <ul className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg z-30">
            {allOptions.map((name) => (
              <li key={name}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory(name);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                    selectedCategory === name
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-12">

        <aside className="hidden md:block w-full md:w-64 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-900 mb-6 tracking-tight">Categories</h2>
          <ul className="space-y-4">
            {allOptions.map((name) => (
              <li key={name}>
                <button
                  onClick={() => setSelectedCategory(name)}
                  className={`text-sm font-medium transition-colors ${
                    selectedCategory === name
                      ? 'text-slate-900 font-bold underline'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <span className="text-sm text-slate-900 font-medium">{filteredProducts.length} items</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12">
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