import { Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen py-16 md:py-24 bg-[#cfcccc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-200/50 mb-6">
            <Shield className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-slate-500 font-medium">
            Last updated: 14/07/2026
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 lg:p-16">
          <div className="space-y-12 text-slate-600 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. Information We Collect
              </h2>
              <p>
                We collect information that you provide directly to us when you create an account, 
                make a purchase, sign up for our newsletter, or contact us for support. This may 
                include your name, email address, shipping address, and payment information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. How We Use Your Information
              </h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-5 space-y-2 text-slate-600 marker:text-slate-400">
                <li>Process your transactions and manage your orders.</li>
                <li>Send you order confirmations and customer support messages.</li>
                <li>Communicate with you about products, services, offers, and promotions.</li>
                <li>Detect and prevent fraudulent transactions and protect the security of our store.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. Sharing of Information
              </h2>
              <p>
                We do not sell or rent your personal information to third parties. We may share your 
                information with trusted service providers who perform services on our behalf, such as 
                payment processing (e.g., Stripe) and order fulfillment.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Security
              </h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, 
                misuse and unauthorized access, disclosure, alteration and destruction. However, no 
                internet or email transmission is ever fully secure or error-free.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                5. Contact Us
              </h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at{' '}
                <a href="mailto:support@luxelane.com" className="font-semibold text-slate-900 hover:underline">
                  support@luxelane.com
                </a>.
              </p>
            </section>
            
          </div>
        </div>

      </div>
    </div>
  );
}