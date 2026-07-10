'use client';

import { Mail, MapPin, Phone, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function ContactPage() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('full-name'),
      email: formData.get('email'),
      message: formData.get('message'),
    };

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
if (response.ok) {
        setIsSuccess(true);
        (e.target as HTMLFormElement).reset(); 

        setTimeout(() => {
          setIsSuccess(false);
        }, 2000); 
        
      } else {
        setError(result.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Failed to send message. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-10 sm:py-16 md:py-24">
      <div className="mb-12 sm:mb-16 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
          Get in touch.
        </h1>
        <p className="text-base sm:text-lg text-slate-900">
          Have a question about a product, your order, or just want to say hello? We would love to hear from you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        
        <div className="flex flex-col justify-center space-y-6 sm:space-y-8 bg-slate-50 p-4 sm:p-6 md:p-10 rounded-2xl border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Contact Information</h2>
          
          <div className="flex flex-col min-[350px]:flex-row items-start gap-2 min-[350px]:gap-4">
            <Mail className="flex-shrink-0 w-6 h-6 text-slate-700 mt-1" />
            <div className="min-w-0 flex-1 w-full">
              <h3 className="font-semibold text-slate-900">Email</h3>
              <p className="text-slate-900 mt-1 break-words">support@store.com</p>
              <p className="text-sm text-slate-700 mt-1">We aim to reply within 24 hours.</p>
            </div>
          </div>

          <div className="flex flex-col min-[350px]:flex-row items-start gap-2 min-[350px]:gap-4">
            <MapPin className="flex-shrink-0 w-6 h-6 text-slate-700 mt-1" />
            <div className="min-w-0 flex-1 w-full">
              <h3 className="font-semibold text-slate-900">Office</h3>
              <p className="text-slate-900 mt-1">Lahore, Pakistan</p>
            </div>
          </div>

          <div className="flex flex-col min-[350px]:flex-row items-start gap-2 min-[350px]:gap-4">
            <Phone className="flex-shrink-0 w-6 h-6 text-slate-700 mt-1" />
            <div className="min-w-0 flex-1 w-full">
              <h3 className="font-semibold text-slate-900">Phone</h3>
              <p className="text-slate-900 mt-1">+92 (0) 123 456 7890</p>
              <p className="text-sm text-slate-700 mt-1">Mon-Fri from 9am to 6pm.</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          {isSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center flex flex-col items-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h3>
              <p className="text-slate-600 mb-6">Thanks for reaching out. We will get back to you shortly.</p>
              
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <div>
                  <label htmlFor="full-name" className="block text-sm font-medium text-slate-700 mb-2">Full name</label>
                  <input 
                    required 
                    name="full-name" 
                    type="text" 
                    id="full-name" 
                    defaultValue={session?.user?.name || ''} 
                    readOnly={!!session?.user} // <-- Locks it if logged in
                    className={`w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-500 text-slate-500 ${session?.user ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`} // <-- Greys it out if logged in
                    placeholder="Jane Doe" 
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                <input 
                  required 
                  name="email" 
                  type="email" 
                  id="email" 
                  defaultValue={session?.user?.email || ''} 
                  readOnly={!!session?.user} 
                  className={`w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-500 text-slate-500 ${session?.user ? 'bg-slate-100 cursor-not-allowed opacity-70' : ''}`} 
                  placeholder="you@example.com " 
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                <textarea required name="message" id="message" rows={5} className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none placeholder:text-slate-500 text-slate-500 " placeholder="How can we help?"></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send message'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}