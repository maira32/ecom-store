import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import Cart from '@/models/Cart';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';
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

      if (checkoutSession.mode === 'subscription') {
        
        const updatedUser = await User.findOneAndUpdate(
          { 
            _id: userId, 
            isPremium: { $ne: true } 
          },
          {
            $set: {
              isPremium: true,
              stripeCustomerId: checkoutSession.customer as string,
              stripeSubscriptionId: checkoutSession.subscription as string,
            }
          },
          { new: true } 
        );

        if (!updatedUser) {
          console.log("Webhook: User is already premium. Skipping duplicate notification.");
          return NextResponse.json({ received: true }, { status: 200 });
        }

        await createNotification(
          userId,
          'Welcome to Premium!',
          'Your membership is now active. Enjoy premium products and perks.'
        );

        const membershipAdmins = await User.find({ role: 'admin' }).select('_id');
        const purchaser = await User.findById(userId).select('name email');
        
        await Promise.all(
          membershipAdmins.map((admin) =>
            createNotification(
              admin._id.toString(),
              'New membership purchase',
              `${purchaser?.name || 'A customer'} just became a Premium member`,
              '/dashboard'
            )
          )
        );

        return NextResponse.json({ received: true }, { status: 200 });
      }

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

      const capturedAddress = checkoutSession.metadata?.captured_address;
      const capturedLatStr = checkoutSession.metadata?.captured_lat;
      const capturedLngStr = checkoutSession.metadata?.captured_lng;

      const deliveryLat = capturedLatStr && capturedLatStr !== 'Not provided' ? parseFloat(capturedLatStr) : undefined;
      const deliveryLng = capturedLngStr && capturedLngStr !== 'Not provided' ? parseFloat(capturedLngStr) : undefined;
      const deliveryAddress = capturedAddress && capturedAddress !== 'Not provided' ? capturedAddress : undefined;

      const order = await Order.create({
        user: userId,
        items: orderItems,
        total,
        status: 'pending',
        stripeSessionId: checkoutSession.id,
        stripePaymentIntentId: checkoutSession.payment_intent as string,
        paymentStatus: 'paid',
        deliveryAddress, 
        deliveryLat,     
        deliveryLng,     
      });

      cart.items = [];
      await cart.save();

      await createNotification(
        userId,
        'Order placed',
        `Your order for $${total.toFixed(2)} has been received.`,
        '/orders'
      );

      const admins = await User.find({ role: 'admin' }).select('_id');
      await Promise.all(
        admins.map((admin) =>
          createNotification(
            admin._id.toString(),
            'New order received',
            `Order #${order._id.toString().slice(-8)} — $${total.toFixed(2)}`,
            '/dashboard/orders'
          )
        )
      );
    } catch (error) {
      console.error("Webhook order creation error:", error);
      return NextResponse.json({ message: "Internal error" }, { status: 500 });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object as Stripe.Subscription;
    try {
      await connectDB();
      
      const user = await User.findOneAndUpdate(
        { stripeSubscriptionId: subscription.id },
        { 
          $set: { isPremium: false },
          $unset: { stripeSubscriptionId: "" } 
        }
      );
   
      if (user) {
        await createNotification(
          user._id.toString(),
          'Membership ended',
          'Your premium membership has ended.'
        );
      }
    } catch (error) {
      console.error("Webhook subscription cancellation error:", error);
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}