import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const reviews = await Review.find({})
      .populate('product', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    console.error("Admin reviews GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}