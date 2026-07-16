import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Order from '@/models/Order';

const VALID_STATUSES = ['pending', 'processing', 'completed', 'cancelled'];

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

    const update: any = { status };
    if (status === 'cancelled') {
      update.cancelReason = reason.trim();
    }

    const updated = await Order.findByIdAndUpdate(id, update, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Admin order PATCH error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}