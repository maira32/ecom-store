import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';
import { DollarSign, Package, Clock3 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {

  await connectDB();
  const productCount = await Product.countDocuments();

  const stats = [
    { label: 'Total Revenue', value: '$0.00', icon: DollarSign },
    { label: 'Active Products', value: productCount, icon: Package },
    { label: 'Pending Orders', value: 0, icon: Clock3 },
  ];

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between"
            >
              <div>
                <h3 className="text-sm font-medium text-slate-600">{stat.label}</h3>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stat.value}</p>
              </div>
              <div className="bg-slate-100 rounded-xl p-2.5">
                <Icon className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-64 flex items-center justify-center text-slate-500 text-sm">
        [Sales Chart Placeholder]
      </div>
    </div>
  );
}