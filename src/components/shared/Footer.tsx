import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-slate-100 bg-white mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 text-sm">
          
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tighter text-slate-900">
              LuxeLane
            </Link>
            <p className="mt-4 text-slate-500 leading-relaxed max-w-xs">
              Curated essentials for the modern individual. Designed with intention, built for everyday use.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Shop</h3>
            <ul className="space-y-3">
              <li><Link href="/categories" className="text-slate-500 hover:text-slate-900 transition-colors">All Products</Link></li>
              <li><Link href="/categories" className="text-slate-500 hover:text-slate-900 transition-colors">New Arrivals</Link></li>
              <li><Link href="/categories" className="text-slate-500 hover:text-slate-900 transition-colors">Accessories</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Support</h3>
            <ul className="space-y-3">
              <li><Link href="/contact" className="text-slate-500 hover:text-slate-900 transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-700">
            © {new Date().getFullYear()} LuxeLane. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}