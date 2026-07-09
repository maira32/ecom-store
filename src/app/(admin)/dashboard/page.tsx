export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">$12,450.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Active Products</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">48</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-700">Pending Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">12</p>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 h-64 flex items-center justify-center text-gray-700">
        [Sales Chart Placeholder]
      </div>
    </div>
  );
}