import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function GET() {
  try {
    await connectDB();
    
    const categories = await Category.find({})
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json({ success: true, data: categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectDB();

    const newCategory = await Category.create({
      name: body.name.trim(),
    });

    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating category:", error);

    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "A category with this name already exists.",
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create category",
      },
      { status: 500 }
    );
  }
}