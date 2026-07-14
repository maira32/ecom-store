import { FileText } from 'lucide-react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen py-16 md:py-24 bg-[#cfcccc]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/60 shadow-sm mb-6">
            <FileText className="w-8 h-8 text-slate-700" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Terms of Service
          </h1>
          <p className="text-slate-700 font-medium">
            Last updated: 14/07/2026
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 md:p-12 lg:p-16">
          <div className="space-y-12 text-slate-600 leading-relaxed">
            
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the LuxeLane website, you agree to be bound by these Terms of Service. 
                If you do not agree to all the terms and conditions of this agreement, then you may not 
                access the website or use any services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                2. Products and Pricing
              </h2>
              <p>
                All products and prices are subject to change at any time without notice. We reserve the 
                right to modify or discontinue any product at any time. We shall not be liable to you or 
                to any third party for any modification, price change, suspension, or discontinuance of 
                the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                3. User Accounts
              </h2>
              <p>
                When you create an account with us, you must provide information that is accurate, 
                complete, and current at all times. Failure to do so constitutes a breach of the Terms, 
                which may result in immediate termination of your account on our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                4. Intellectual Property
              </h2>
              <p>
                The Service and its original content, features, and functionality are and will remain 
                the exclusive property of LuxeLane and its licensors. The Service is protected by 
                copyright, trademark, and other laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                5. Contact Information
              </h2>
              <p>
                Questions about the Terms of Service should be sent to us at{' '}
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