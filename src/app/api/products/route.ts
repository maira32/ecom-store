import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Product from '@/models/Product';

export async function GET() {
  try {
    await connectDB();
    const products = await Product.find({}).sort({ createdAt: -1 }); // Newest first
    
    return NextResponse.json({ success: true, data: products }, { status: 200 });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();
    
    const newProduct = await Product.create(body);
    
    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, message: "Failed to create product" }, { status: 500 });
  }
}