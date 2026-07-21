import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { stripe } from '@/lib/stripe';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user || !user.stripeSubscriptionId) {
      return NextResponse.json({ message: "No active subscription found" }, { status: 404 });
    }

    await stripe.subscriptions.cancel(user.stripeSubscriptionId);

    user.isPremium = false;
    user.stripeSubscriptionId = undefined; 
    await user.save();

    await createNotification(
      userId,
      'Membership ended',
      'Your premium membership has ended successfully.'
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Subscription cancellation error:", error);
    return NextResponse.json({ message: "Failed to cancel subscription" }, { status: 500 });
  }
}