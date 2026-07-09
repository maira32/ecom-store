import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#d6d3d3]">
      
      <aside className="w-64 bg-[#cfcccc] text-slate-900 p-6 flex flex-col">
        <h2 className="text-xl font-bold mb-8 tracking-tight">Admin Panel</h2>
        
        <nav className="flex flex-col gap-4 flex-grow">
          <Link href="/dashboard" className="text-slate-900 hover:text-white font-medium transition-colors">
            Dashboard Overview
          </Link>
          <Link href="/dashboard/products" className="text-slate-900 hover:text-white font-medium transition-colors">
            Products
          </Link>
          <Link href="/dashboard/categories" className="text-slate-900 hover:text-white font-medium transition-colors">
            Categories
          </Link>
        </nav>

        <div className="mt-auto border-t border-slate-700 pt-6">
          <Link href="/" className="text-slate-900 hover:text-white text-sm transition-colors">
            ← Back to Store
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 p-8 overflow-y-auto h-screen">
        {children}
      </main>

    </div>
  );
}