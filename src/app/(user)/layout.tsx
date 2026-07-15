import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { Toaster } from 'react-hot-toast';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  let cartCount = 0;

  if (session && (session.user as any).id) {
    try {
      await connectDB();
      
      const cart = await Cart.findOne({ user: (session.user as any).id }).populate('items.product');
      
      if (cart) {
        const validItems = cart.items.filter((item: any) => item.product != null);


        cartCount = validItems.length;
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={cartCount} />
      <Toaster position="top-right" />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}