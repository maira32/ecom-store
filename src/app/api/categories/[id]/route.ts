import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';
import Product from '@/models/Product';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await request.json();

    if (!name?.trim()) {
      return NextResponse.json({ success: false, message: "Name is required" }, { status: 400 });
    }

    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    const oldName = category.name;
    category.name = name.trim();

    try {
      await category.save();
    } catch (err: any) {
      if (err.code === 11000) {
        return NextResponse.json(
          { success: false, message: "A category with that name already exists" },
          { status: 409 }
        );
      }
      throw err;
    }

    if (oldName !== category.name) {
      await Product.updateMany({ category: oldName }, { category: category.name });
    }

    return NextResponse.json({ success: true, data: category }, { status: 200 });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, message: "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }

    const productCount = await Product.countDocuments({ category: category.name });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot delete "${category.name}" — ${productCount} product${productCount > 1 ? 's' : ''} still use this category. Reassign or delete ${productCount > 1 ? 'them' : 'it'} first.`,
        },
        { status: 409 }
      );
    }

    const deleted = await Category.findByIdAndDelete(id);
    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: "Failed to delete category" }, { status: 500 });
  }
}