'use client';

import { UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function ProductForm() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const categories = ["Accessories", "Kitchen", "Bags", "Workspace", "Tech"]; 

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price), 
          category: formData.category,
          description: formData.description,
          stock: 10, 
          imageUrl: `https://picsum.photos/seed/${formData.name.replace(/\s+/g, '')}/600/600`, 
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/dashboard/products');
        router.refresh(); 
      } else {
        alert("Failed to save product.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred connecting to the database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-black  " 
              placeholder="e.g. Minimalist Watch" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
              <input 
                type="number" 
                name="price"
                step="0.01" 
                required
                value={formData.price}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none placeholder:text-black  " 
                placeholder="0.00" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select 
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white text-slate-900  "
              >
                <option value="">Select category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea 
              name="description"
              rows={5} 
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none placeholder:text-black  " 
              placeholder="Product details..."
            ></textarea>
          </div>
        </div>

        <div className="space-y-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
          <div 
            className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl transition-colors ${
              dragActive ? 'border-slate-900 bg-slate-50' : 'border-slate-300 hover:bg-slate-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrag} 
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-700">
              <UploadCloud className="w-10 h-10 mb-3 text-slate-700" />
              <p className="mb-2 text-sm font-semibold">Image Upload Disabled</p>
              <p className="text-xs text-center px-4">A high-quality placeholder image will be assigned automatically upon save.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
        <button 
          type="button" 
          onClick={() => router.push('/dashboard/products')} 
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </button>
      </div>
    </form>
  );
}