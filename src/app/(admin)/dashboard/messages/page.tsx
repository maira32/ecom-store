import { connectDB } from '@/lib/mongodb';
import Message from '@/models/Message';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import DeleteMessageButton from '@/components/ui/DeleteMessageButton';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'admin') {
    redirect('/login');
  }

  await connectDB();
  const messages = await Message.find({}).sort({ createdAt: -1 });

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Inbox</h1>
        <p className="text-slate-500 mt-2">Manage customer inquiries and contact form submissions.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No messages yet. You are all caught up!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                  <th className="p-4 font-semibold w-32">Date</th>
                  <th className="p-4 font-semibold w-48">Customer</th>
                  <th className="p-4 font-semibold w-48">Email</th>
                  <th className="p-4 font-semibold">Message</th>
                  <th className="p-4 font-semibold w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {messages.map((msg) => (
                  <tr key={msg._id.toString()} className="hover:bg-slate-50 transition-colors align-top">
                    
                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    
                    <td className="p-4 text-sm font-medium text-slate-900 whitespace-nowrap">
  {msg.fullName}
</td>
                    
                    <td className="p-4 text-sm text-slate-500 whitespace-nowrap">
                      <a href={`mailto:${msg.email}`} className="hover:text-slate-900 hover:underline">
                        {msg.email}
                      </a>
                    </td>
                    
                    <td className="p-4 text-sm text-slate-700 max-w-md">
                      <details className="group cursor-pointer">
                        <summary className="truncate outline-none list-none font-medium hover:text-slate-900 transition-colors [&::-webkit-details-marker]:hidden">
                          {msg.message}
                        </summary>
                        <div className="mt-2 text-slate-600 whitespace-pre-wrap leading-relaxed border-t border-slate-100 pt-2">
                          {msg.message}
                        </div>
                      </details>
                    </td>
                    
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        {msg.isRead ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        )}
                        
                        <DeleteMessageButton id={msg._id.toString()} />
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}