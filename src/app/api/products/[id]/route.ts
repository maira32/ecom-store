import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    await connectDB();
    const updated = await Product.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!updated) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, message: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, message: "Failed to delete product" }, { status: 500 });
  }
}