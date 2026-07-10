'use client';

import { Plus, Trash2, Loader2, Tags } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Category {
  _id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) setCategories(data.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => [...prev, data.data]);
        setNewCategoryName('');
      } else {
        setError(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Add category failed:', err);
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      } else {
        alert('Failed to delete category');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mt-1 text-sm text-slate-600">Organize your products into collections.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Add Category</h3>
          <form className="space-y-4" onSubmit={handleAddCategory}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-400 text-slate-900"
                placeholder="e.g. Summer Collection"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Create
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          {loading ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
              <div className="bg-slate-100 rounded-full p-3 mb-4">
                <Tags className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-700 font-medium">No categories yet</p>
              <p className="text-sm text-slate-500 mt-1">Create one to start organizing products.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 uppercase">Category Name</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {categories.map((cat) => (
                    <tr key={cat._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          disabled={deletingId === cat._id}
                          className="text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === cat._id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}