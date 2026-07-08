'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function AdminCategoriesPage() {
  // 1. Convert dummy data to React State
  const [categories, setCategories] = useState([
    { id: "1", name: "Accessories", count: 12 },
    { id: "2", name: "Kitchen", count: 8 },
    { id: "3", name: "Bags", count: 15 },
  ]);
  const [newCategoryName, setNewCategoryName] = useState("");

  // 2. Add Logic
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    
    const newCat = {
      id: Date.now().toString(),
      name: newCategoryName,
      count: 0 
    };
    
    setCategories([...categories, newCat]);
    setNewCategoryName("");
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
          <p className="mt-2 text-sm text-slate-500">Organize your products into collections.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <div className="col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Add Category</h3>
          <form className="space-y-4" onSubmit={handleAddCategory}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input 
                type="text" 
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" 
                placeholder="e.g. Summer Collection" 
              />
            </div>
            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create
            </button>
          </form>
        </div>

        <div className="col-span-1 md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Products</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{cat.count} items</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-slate-500">No categories found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}