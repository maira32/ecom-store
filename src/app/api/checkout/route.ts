import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ message: "Admin accounts can't make purchases." }, { status: 403 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    const validItems = (cart?.items || []).filter((item: any) => item.product != null);

    if (validItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const lineItems = validItems.map((item: any) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.product.name,
          images: item.product.imageUrl ? [item.product.imageUrl] : [],
        },
        unit_amount: Math.round(item.product.price * 100),
      },
      quantity: item.quantity,
    }));

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: lineItems,
      success_url: `${process.env.NEXTAUTH_URL}/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/cart`,
      metadata: {
        userId,
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json({ message: "Failed to start checkout" }, { status: 500 });
  }
}