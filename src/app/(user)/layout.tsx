import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  // 1. Check the secure session
  const session = await getServerSession(authOptions);
  let cartCount = 0;

  // 2. Count their items in MongoDB if they are logged in
  if (session && (session.user as any).id) {
    try {
      await connectDB();
      const cart = await Cart.findOne({ user: (session.user as any).id });
      if (cart) {
        cartCount = cart.items.reduce((total: number, item: any) => total + item.quantity, 0);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={cartCount} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}