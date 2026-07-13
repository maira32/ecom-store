import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Order from '@/models/Order';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const orders = await Order.find({ user: (session.user as any).id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const userId = (session.user as any).id;
    await connectDB();

    const cart = await Cart.findOne({ user: userId }).populate('items.product').lean();
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const validItems = (cart.items as any).filter((item: any) => item.product != null);
    if (validItems.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const orderItems = validItems.map((item: any) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }));

    const total = orderItems.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);

    const order = await Order.create({
      user: userId,
      items: orderItems,
      total,
      status: 'pending',
    });

    await Cart.updateOne({ user: userId }, { $set: { items: [] } });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Orders POST error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}