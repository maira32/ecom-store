export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="text-xl font-bold mb-8">Admin Panel</h2>
        <nav className="flex flex-col gap-4">
          <span className="text-gray-300 hover:text-white cursor-pointer">Dashboard</span>
          <span className="text-gray-300 hover:text-white cursor-pointer">Products</span>
          <span className="text-gray-300 hover:text-white cursor-pointer">Orders</span>
        </nav>
      </aside>
      
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}