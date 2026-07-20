import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Please log in to subscribe" }, { status: 401 });
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ message: "Admin accounts can't subscribe" }, { status: 403 });
    }

    if (!process.env.STRIPE_MEMBERSHIP_PRICE_ID) {
      return NextResponse.json({ message: "Membership pricing is not configured" }, { status: 500 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env.STRIPE_MEMBERSHIP_PRICE_ID, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/subscribe?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/subscribe`,
      metadata: {
        userId: (session.user as any).id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url }, { status: 200 });
  } catch (error) {
    console.error("Subscription checkout error:", error);
    return NextResponse.json({ message: "Failed to start subscription checkout" }, { status: 500 });
  }
}