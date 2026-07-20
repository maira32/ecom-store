import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return NextResponse.json({ success: false, message: "Review not found" }, { status: 404 });
    }

    const isOwner = review.user.toString() === (session.user as any).id;
    const isAdmin = (session.user as any).role === 'admin';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await Review.findByIdAndDelete(id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Review DELETE error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}