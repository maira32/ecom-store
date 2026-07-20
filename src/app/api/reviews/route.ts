import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Review from '@/models/Review';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ success: false, message: "productId is required" }, { status: 400 });
    }

    await connectDB();
    const reviews = await Review.find({ product: productId }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ success: true, data: reviews }, { status: 200 });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ success: false, message: "Please log in to leave a review" }, { status: 401 });
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ success: false, message: "Admin accounts can't leave reviews" }, { status: 403 });
    }

    const { productId, rating, comment } = await request.json();

    if (!productId || !rating || !comment?.trim()) {
      return NextResponse.json({ success: false, message: "Rating and comment are required" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: "Rating must be between 1 and 5" }, { status: 400 });
    }

    await connectDB();

    const review = await Review.create({
      product: productId,
      user: (session.user as any).id,
      userName: session.user?.name || 'Anonymous',
      rating,
      comment: comment.trim(),
    });

    return NextResponse.json({ success: true, data: review }, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "You've already reviewed this product" },
        { status: 409 }
      );
    }
    console.error("Reviews POST error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}