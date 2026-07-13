'use client';

import { Plus, Edit, Trash2, Loader2, Package } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminPagination from '@/components/ui/AdminPagination';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success) setProducts(data.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const promptDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;

    const id = productToDelete._id;
    setDeletingId(id);
    setProductToDelete(null); 

    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        toast.success('Product deleted successfully!'); 
      } else {
        toast.error(data.message || 'Failed to delete product'); 
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Something went wrong'); 
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(products.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedProducts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return products.slice(start, start + pageSize);
  }, [products, safePage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">Manage your store inventory and catalog.</p>
        </div>
        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors flex-shrink-0"
        >
          <Plus className="h-5 w-5" />
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
          <div className="bg-slate-100 rounded-full p-3 mb-4">
            <Package className="w-6 h-6 text-slate-500" />
          </div>
          <p className="text-slate-700 font-medium">No products yet</p>
          <p className="text-sm text-slate-500 mt-1">Add your first product to see it here.</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-slate-500 mb-2 md:hidden">← Swipe to see all columns →</p>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[640px] w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {paginatedProducts.map((product) => (
                    <tr key={product._id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-slate-900">{product.name}</div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">{product.category}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-900">${product.price.toFixed(2)}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/dashboard/products/${product._id}`}
                            className="text-slate-600 hover:text-slate-900 transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          
                          <button
                            onClick={() => promptDelete(product)}
                            disabled={deletingId === product._id}
                            className="text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
                          >
                            {deletingId === product._id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AdminPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={products.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        </>
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Product?</h3>
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete <strong>"{productToDelete.name}"</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}