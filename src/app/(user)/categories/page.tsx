'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import ProductCard from "@/components/ui/ProductCard";
import { Loader2, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

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

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, safePage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  const allOptions = ['All', ...categories.map((c) => c.name)];

  const countFor = (name: string) =>
    name === 'All' ? allProducts.length : allProducts.filter((p) => p.category === name).length;

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
          <div className="sticky top-24">
            <h2 className="text-lg font-bold text-slate-900 mb-4 tracking-tight">Categories</h2>
            <ul className="space-y-1 max-h-[calc(100vh-10rem)] overflow-y-auto pr-2">
              {allOptions.map((name) => (
                <li key={name}>
                  <button
                    onClick={() => setSelectedCategory(name)}
                    className={`w-full flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      selectedCategory === name
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span className="truncate">{name}</span>
                    <span className={`text-xs ${selectedCategory === name ? 'text-slate-300' : 'text-slate-400'}`}>
                      {countFor(name)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
            </h1>
            <span className="text-sm text-slate-900 font-medium">{filteredProducts.length} items</span>
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-center text-slate-500 py-16">No products found in this category.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 md:gap-x-8 gap-y-10 md:gap-y-12">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    category={product.category}
                  />
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-12">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-slate-200 rounded-lg px-2 py-1.5 text-slate-900 focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                  <span>per page</span>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                      .map((p, idx, arr) => (
                        <span key={p} className="flex items-center gap-2">
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="text-slate-400 text-sm">…</span>
                          )}
                          <button
                            onClick={() => setPage(p)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                              p === safePage
                                ? 'bg-orange-500 text-white'
                                : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {p}
                          </button>
                        </span>
                      ))}

                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

    </div>
  );
}