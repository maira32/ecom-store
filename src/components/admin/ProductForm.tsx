'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, UploadCloud, X } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  productId?: string;
}

export default function ProductForm({ productId }: ProductFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(productId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.data);
      })
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const p = data.data;
          setName(p.name);
          setDescription(p.description || '');
          setPrice(String(p.price));
          setStock(String(p.stock));
          setCategory(p.category);
          setImages(p.images?.length ? p.images : p.imageUrl ? [p.imageUrl] : []);
        }
      })
      .catch((err) => console.error('Failed to load product:', err))
      .finally(() => setLoading(false));
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append(
          'upload_preset',
          process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET as string
        );

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await res.json();
        if (!data.secure_url) throw new Error('Upload failed');
        return data.secure_url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (err) {
      console.error('Upload error:', err);
      setError('One or more images failed to upload');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !description.trim() || !price || !stock || !category) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    const payload = {
      name: name.trim(),
      description: description.trim(),
      price: parseFloat(price),
      stock: parseInt(stock, 10),
      category,
      images,
      imageUrl: images[0] || '',
    };

    try {
      const res = await fetch(
        isEditMode ? `/api/products/${productId}` : '/api/products',
        {
          method: isEditMode ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();

      if (data.success) {
        router.push('/dashboard/products');
        router.refresh();
      } else {
        setError(data.message || 'Failed to save product');
      }
    } catch (err) {
      console.error('Save failed:', err);
      setError('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-500 text-slate-900 "
          placeholder="e.g. Matte Black Watch"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-500 text-slate-900"
          rows={4}
          placeholder="Describe the product..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Price</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-500 text-slate-900"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Stock</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-500 text-slate-900"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-slate-500 text-slate-900"
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Product Images</label>
        <p className="text-xs text-slate-500 mb-3">
          The first image is used as the main product photo everywhere else on the site.
        </p>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-3">
            {images.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`Product image ${idx + 1}`}
                  className={`h-20 w-20 rounded-lg object-cover border-2 ${idx === 0 ? 'border-slate-900' : 'border-slate-200'}`}
                />
                {idx === 0 && (
                  <span className="absolute -top-2 -left-2 bg-slate-900 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 text-sm text-slate-700 w-fit">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? 'Uploading...' : 'Add image(s)'}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
      >
        {submitting ? 'Saving...' : isEditMode ? 'Update Product' : 'Create Product'}
      </button>
    </form>
  );
}