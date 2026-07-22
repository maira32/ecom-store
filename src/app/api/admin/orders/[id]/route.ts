import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';
import { createNotification } from '@/lib/notifications';

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];


const PIPELINE_RANK: Record<string, number> = {
  pending: 0,
  processing: 1,
  completed: 2,
};

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

    const isCancelling = status === 'cancelled';
    const isReactivating = fromStatus === 'cancelled' && status !== 'cancelled';
    const isBackwardMove =
      !isCancelling &&
      !isReactivating &&
      PIPELINE_RANK[status] < PIPELINE_RANK[fromStatus];

    
    const requiresReason = isCancelling || isReactivating || isBackwardMove;

    if (requiresReason && !reason?.trim()) {
      const messages: Record<string, string> = {
        cancel: "A reason is required when cancelling an order",
        reactivate: "A reason is required to reactivate a cancelled order",
        revert: "A reason is required to revert an order to an earlier status",
      };
      const key = isCancelling ? 'cancel' : isReactivating ? 'reactivate' : 'revert';
      return NextResponse.json({ success: false, message: messages[key] }, { status: 400 });
    }

    const update: any = {
      status,
      $push: {
        statusHistory: {
          from: fromStatus,
          to: status,
          reason: reason?.trim() || undefined,
          changedAt: new Date(),
        },
      },
    };

    if (isCancelling) {
      update.cancelReason = reason.trim();
    } else if (isReactivating || isBackwardMove) {
      update.revertReason = reason.trim();
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });

    if (updated) {
      let message: string;
      if (isCancelling) {
        message = `Your order was cancelled: ${reason.trim()}`;
      } else if (isReactivating) {
        message = `Your order was reactivated and is now ${STATUS_LABELS[status]}: ${reason.trim()}`;
      } else if (isBackwardMove) {
        message = `Your order's status was corrected to ${STATUS_LABELS[status]}: ${reason.trim()}`;
      } else {
        const FORWARD_MESSAGES: Record<string, string> = {
          processing: 'Your order has been accepted and is being prepared.',
          completed: 'Your order has been marked Completed.',
        };
        message = FORWARD_MESSAGES[status] || `Your order is now ${STATUS_LABELS[status]}.`;
      }

      await createNotification(updated.user.toString(), 'Order status updated', message, '/orders');
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}