import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { createNotification } from '@/lib/notifications';

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];
const BACKWARD_FROM_COMPLETED = ['pending', 'processing'];

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { status, reason } = await request.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, message: "Invalid status" }, { status: 400 });
    }

    if (status === 'cancelled' && !reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "A reason is required when cancelling an order" },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const isRevertFromCompleted =
      existing.status === 'completed' && BACKWARD_FROM_COMPLETED.includes(status);

    if (isRevertFromCompleted && !reason?.trim()) {
      return NextResponse.json(
        { success: false, message: "A reason is required to revert an order out of Completed" },
        { status: 400 }
      );
    }

    const update: any = { status };
    if (status === 'cancelled') {
      update.cancelReason = reason.trim();
    }
    if (isRevertFromCompleted) {
      update.revertReason = reason.trim();
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });

    const STATUS_MESSAGES: Record<string, string> = {
      pending: 'Your order is now marked Pending.',
      processing: 'Your order has been accepted and is being prepared.',
      completed: 'Your order has been marked Completed.',
      cancelled: `Your order was cancelled: ${reason || ''}`,
    };

    if (updated) {
      let message = STATUS_MESSAGES[status];
      if (isRevertFromCompleted) {
        message = `Your order's status was corrected: ${reason}`;
      }
      await createNotification(
        updated.user.toString(),
        'Order status updated',
        message,
        '/orders'
      );
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}