'use client';

import { Plus, Trash2, Edit, Loader2, Tags } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import AdminPagination from '@/components/ui/AdminPagination';
import CategoryModal from '@/components/ui/CategoryModal';
import toast from 'react-hot-toast'; 

interface Category {
  _id: string;
  name: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const handleAdd = async (name: string) => {
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) => [...prev, data.data]);
        setAddOpen(false);
        toast.success('Category added successfully'); 
      } else {
        setModalError(data.message || 'Failed to add category');
      }
    } catch (err) {
      console.error('Add category failed:', err);
      setModalError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (name: string) => {
    if (!editTarget) return;
    setSubmitting(true);
    setModalError('');
    try {
      const res = await fetch(`/api/categories/${editTarget._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();

      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === editTarget._id ? data.data : c))
        );
        setEditTarget(null);
        toast.success('Category updated successfully'); 
      } else {
        setModalError(data.message || 'Failed to update category');
      }
    } catch (err) {
      console.error('Update category failed:', err);
      setModalError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    if (!categoryToDelete) return;

    setDeletingId(categoryToDelete);
    try {
      const res = await fetch(`/api/categories/${categoryToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      
      if (data.success) {
        setCategories((prev) => prev.filter((cat) => cat._id !== categoryToDelete));
        toast.success('Category deleted successfully');
        setCategoryToDelete(null); 
      } else {
        toast.error(data.message || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Delete failed:', err);
      toast.error('Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  const totalPages = Math.max(1, Math.ceil(categories.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedCategories = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return categories.slice(start, start + pageSize);
  }, [categories, safePage, pageSize]);

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return (
    <>
      <div>
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Categories</h1>
            <p className="mt-1 text-sm text-slate-600">Organize your products into collections.</p>
          </div>
          <button
            onClick={() => {
              setModalError('');
              setAddOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

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
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedCategories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setModalError('');
                            setEditTarget(cat);
                          }}
                          className="text-slate-600 hover:text-slate-900 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat._id)} 
                          disabled={deletingId === cat._id}
                          className="text-slate-600 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deletingId === cat._id ? (
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

            <AdminPagination
              currentPage={safePage}
              totalPages={totalPages}
              pageSize={pageSize}
              totalItems={categories.length}
              onPageChange={setPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </div>
        )}

        {addOpen && (
          <CategoryModal
            mode="add"
            submitting={submitting}
            error={modalError}
            onCancel={() => setAddOpen(false)}
            onConfirm={handleAdd}
          />
        )}

        {editTarget && (
          <CategoryModal
            mode="edit"
            initialName={editTarget.name}
            submitting={submitting}
            error={modalError}
            onCancel={() => setEditTarget(null)}
            onConfirm={handleEdit}
          />
        )}
      </div>

      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-slate-100">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Category?</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed whitespace-normal break-words">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setCategoryToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executeDelete}
                disabled={deletingId !== null}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId !== null && <Loader2 className="w-4 h-4 animate-spin" />}
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}