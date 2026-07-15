import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import Stripe from 'stripe';

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;
    const userId = checkoutSession.metadata?.userId;

    if (!userId) {
      console.error("Webhook: no userId in session metadata");
      return NextResponse.json({ received: true }, { status: 200 });
    }

    try {
      await connectDB();

      const existing = await Order.findOne({ stripeSessionId: checkoutSession.id });
      if (existing) {
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      const validItems = (cart?.items || []).filter((item: any) => item.product != null);

      if (validItems.length === 0) {
        console.error("Webhook: cart was empty at fulfillment time for user", userId);
        return NextResponse.json({ received: true }, { status: 200 });
      }

      const orderItems = validItems.map((item: any) => ({
        product: item.product._id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      }));

      const total = orderItems.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );

      await Order.create({
        user: userId,
        items: orderItems,
        total,
        status: 'pending',
        stripeSessionId: checkoutSession.id,
       
        stripePaymentIntentId: checkoutSession.payment_intent as string,
        paymentStatus: 'paid',
      });

      cart.items = [];
      await cart.save();
    } catch (error) {
      console.error("Webhook order creation error:", error);
      return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}