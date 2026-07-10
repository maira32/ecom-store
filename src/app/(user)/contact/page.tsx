import { Mail, MapPin, Phone, ArrowRight } from 'lucide-react';

export default function ContactPage() {
  return (
    // Reduced outer padding (px-3) and top padding for ultra-small screens
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
        
        {/* Reduced inner padding to p-4 on the smallest screens */}
        <div className="flex flex-col justify-center space-y-6 sm:space-y-8 bg-slate-50 p-4 sm:p-6 md:p-10 rounded-2xl border border-slate-100">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Contact Information</h2>
          
          {/* Stack icon and text (flex-col) until the screen hits 350px, then go back to flex-row */}
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

        <form className="space-y-5 sm:space-y-6 flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium text-slate-700 mb-2">First name</label>
              <input type="text" id="first-name" className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400" placeholder="Jane" />
            </div>
            <div>
              <label htmlFor="last-name" className="block text-sm font-medium text-slate-700 mb-2">Last name</label>
              <input type="text" id="last-name" className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">Email</label>
            <input type="email" id="email" className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400" placeholder="you@example.com" />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">Message</label>
            <textarea id="message" rows={5} className="w-full px-3 py-2 sm:px-4 sm:py-3 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all resize-none placeholder:text-slate-400" placeholder="How can we help?"></textarea>
          </div>

          <button type="button" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors w-full sm:w-auto">
            Send message
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}