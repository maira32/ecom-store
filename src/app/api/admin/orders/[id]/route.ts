import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { createNotification } from '@/lib/notifications';
import { isTerminal, getRevertEligibility } from '@/lib/orderStatus';

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

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

    await connectDB();

    const existing = await Order.findById(id);
    if (!existing) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    const fromStatus = existing.status;

    if (status === fromStatus) {
      return NextResponse.json({ success: true, data: existing }, { status: 200 });
    }

    const fromIsTerminal = isTerminal(fromStatus);
    const isCancelling = status === 'cancelled';
    const isCompleting = status === 'completed';

    const update: any = {
      $push: {
        statusHistory: { from: fromStatus, to: status, changedAt: new Date() },
      },
    };

    if (fromIsTerminal) {
      const { eligible, remainingMs } = getRevertEligibility(fromStatus, existing.statusHistory || []);

      if (!eligible) {
        return NextResponse.json(
          {
            success: false,
            message: `This order was marked ${STATUS_LABELS[fromStatus]} more than 10 minutes ago and can no longer be changed.`,
          },
          { status: 400 }
        );
      }

      if (!reason?.trim()) {
        const minutesLeft = Math.ceil(remainingMs / 60000);
        return NextResponse.json(
          {
            success: false,
            message: `A reason is required to correct this order (${minutesLeft} minute${minutesLeft !== 1 ? 's' : ''} left to do so).`,
          },
          { status: 400 }
        );
      }

      update.revertReason = reason.trim();
      update.$push.statusHistory.reason = reason.trim();
    }

    else if (isCancelling) {
      if (!reason?.trim()) {
        return NextResponse.json(
          { success: false, message: "A reason is required when cancelling an order" },
          { status: 400 }
        );
      }
      update.cancelReason = reason.trim();
      update.$push.statusHistory.reason = reason.trim();
    }

    else if (isCompleting) {

    }

    update.status = status;

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });

    if (updated) {
      let message: string;
      if (isCancelling) {
        message = `Your order was cancelled: ${reason.trim()}`;
      } else if (fromIsTerminal) {
        message = `Your order's status was corrected to ${STATUS_LABELS[status]}: ${reason.trim()}`;
      } else if (isCompleting) {
        message = 'Your order has been marked Completed.';
      } else {
        message = `Your order is now ${STATUS_LABELS[status]}.`;
      }

      await createNotification(updated.user.toString(), 'Order status updated', message, '/orders');
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}