import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { stripe } from '@/lib/stripe';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { reason } = await request.json();

    if (!reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "A reason is required to issue a refund" },
        { status: 400 }
      );
    }

    await connectDB();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus === 'refunded') {
      return NextResponse.json({ success: true, data: order }, { status: 200 });
    }

    if (order.paymentStatus !== 'paid') {
      return NextResponse.json(
        { success: false, message: "Only paid orders can be refunded" },
        { status: 400 }
      );
    }

    let paymentIntentId = order.stripePaymentIntentId;

    if (!paymentIntentId && order.stripeSessionId) {
      try {
        const checkoutSession = await stripe.checkout.sessions.retrieve(order.stripeSessionId);
        paymentIntentId = checkoutSession.payment_intent as string;
      } catch (err) {
        console.error("Could not retrieve Stripe session for refund fallback:", err);
        return NextResponse.json(
          {
            success: false,
            message: "This order's Stripe payment record could not be found (it may have expired). It can't be refunded automatically — issue the refund manually in the Stripe dashboard if the charge still exists.",
          },
          { status: 400 }
        );
      }
    }

    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, message: "This order has no linked Stripe payment to refund" },
        { status: 400 }
      );
    }

    try {
      await stripe.refunds.create({ payment_intent: paymentIntentId });
    } catch (err: any) {
      if (err?.code === 'charge_already_refunded') {
        order.paymentStatus = 'refunded';
        order.refundReason = reason.trim();
        await order.save();
        await createNotification(
          order.user.toString(),
          'Order refunded',
          `Your order was refunded: ${reason.trim()}`,
          '/orders'
        );
        return NextResponse.json({ success: true, data: order }, { status: 200 });
      }

      console.error("Stripe refund creation failed:", err);
      return NextResponse.json(
        { success: false, message: err?.message || "Stripe rejected the refund request" },
        { status: 400 }
      );
    }

  
    order.paymentStatus = 'refunded';
    order.refundReason = reason.trim();
    await order.save();

    await createNotification(
      order.user.toString(),
      'Order refunded',
      `Your order was refunded: ${reason.trim()}`,
      '/orders'
    );

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error: any) {
    console.error("Refund error:", error);
    return NextResponse.json(
      { success: false, message: error?.message || "Refund failed for an unknown reason" },
      { status: 500 }
    );
  }
}