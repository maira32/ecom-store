import { Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminProductsPage() {
  const dummyProducts = [
    { id: "1", name: "Matte Black Watch", price: 120.00, stock: 15, category: "Accessories" },
    { id: "2", name: "Ceramic Pour-over", price: 45.00, stock: 0, category: "Kitchen" },
    { id: "3", name: "Leather Tote", price: 189.00, stock: 5, category: "Bags" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products</h1>
          <p className="mt-2 text-sm text-slate-500">Manage your store inventory and catalog.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            href="/dashboard/products/new" 
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add New Product
          </Link>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Product Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {dummyProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="font-medium text-slate-900">{product.name}</div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">{product.category}</td>
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
                      href={`/dashboard/products/${product.id}`}
                      className="text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}