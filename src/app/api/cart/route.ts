import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Cart from '@/models/Cart';
import Product from '@/models/Product'; 

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const cart = await Cart.findOne({ user: (session.user as any).id })
      .populate({ path: 'items.product', model: Product })
      .lean();

    if (!cart) {
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error("Cart GET error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ message: "Admin accounts can't make purchases." }, { status: 403 });
    }

    const { productId, quantity = 1 } = await request.json();
    const userId = (session.user as any).id;

    await connectDB();

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [{ product: productId, quantity }]
      });
      return NextResponse.json(cart, { status: 201 });
    }

    const existingItemIndex = cart.items.findIndex(
      (item: any) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return NextResponse.json(cart, { status: 200 });

  } catch (error) {
    console.error("Cart POST error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role === 'admin') {
      return NextResponse.json({ message: "Admin accounts can't make purchases." }, { status: 403 });
    }

    const { productId, quantity } = await request.json();
    const userId = (session.user as any).id;

    if (!productId || typeof quantity !== 'number' || quantity < 1) {
      return NextResponse.json({ message: "Invalid productId or quantity" }, { status: 400 });
    }

    await connectDB();

    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId, 'items.product': productId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true } 
    ).populate({ path: 'items.product', model: Product }).lean();

    if (!updatedCart) {
      const cartExists = await Cart.exists({ user: userId });
      if (!cartExists) return NextResponse.json({ message: "Cart not found" }, { status: 404 });
      
      return NextResponse.json({ message: "Item not in cart" }, { status: 404 });
    }

    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    console.error("Cart PATCH error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !(session.user as any).id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const clear = searchParams.get('clear');

    await connectDB();

    if (clear === 'true') {
      const clearedCart = await Cart.findOneAndUpdate(
        { user: userId },
        { $set: { items: [] } },
        { new: true }
      ).lean();
      
      if (!clearedCart) return NextResponse.json({ message: "Cart not found" }, { status: 404 });
      return NextResponse.json(clearedCart, { status: 200 });
    }

    if (!productId) {
      return NextResponse.json({ message: "productId is required" }, { status: 400 });
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { user: userId },
      { $pull: { items: { product: productId } } },
      { new: true }
    ).populate({ path: 'items.product', model: Product }).lean();

    if (!updatedCart) {
      return NextResponse.json({ message: "Cart not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCart, { status: 200 });

  } catch (error) {
    console.error("Cart DELETE error:", error);
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}