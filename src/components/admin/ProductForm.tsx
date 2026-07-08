'use client';

import { UploadCloud, X } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation'; 

export default function ProductForm() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const categories = ["Accessories", "Kitchen", "Bags", "Workspace", "Tech"]; // This will come from your DB later

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  return (
    <form className="space-y-8 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm max-w-4xl">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Name</label>
            <input type="text" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="e.g. Minimalist Watch" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
              <input type="number" step="0.01" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none" placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
              <select className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none bg-white">
                <option value="">Select category...</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea rows={5} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none resize-none" placeholder="Product details..."></textarea>
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
            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
              <UploadCloud className="w-10 h-10 mb-3 text-slate-400" />
              <p className="mb-2 text-sm font-semibold">Click to upload or drag and drop</p>
              <p className="text-xs">SVG, PNG, JPG or WEBP (MAX. 5MB)</p>
            </div>
            <input type="file" className="hidden" accept="image/*" />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 border-t border-slate-100 pt-6">
        <button 
          type="button" 
          onClick={() => router.push('/dashboard/products')} // <-- Add onClick here
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button type="submit" className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
          Save Product
        </button>
      </div>
    </form>
  );
}