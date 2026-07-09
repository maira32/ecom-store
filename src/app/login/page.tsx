'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false, 
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push('/dashboard');
        router.refresh(); 
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#cfcccc] px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl border border-slate-200 shadow-sm">
        
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Sign in to manage the LuxeLane storefront.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border  text-slate-500 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-500  "
                placeholder="email@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border  text-slate-500 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:outline-none transition-all placeholder:text-slate-500  "
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
            &larr; Back to Store
          </Link>
        </div>
        
      </div>
    </div>
  );
}