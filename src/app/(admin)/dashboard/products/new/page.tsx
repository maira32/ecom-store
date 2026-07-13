import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast from 'react-hot-toast';

export default function NewProductPage() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link 
          href="/dashboard/products" 
          className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Add New Product</h1>
        <p className="mt-2 text-sm text-slate-700">Create a new item in your store's catalog.</p>
      </div>

      <ProductForm />
    </div>
  );
}