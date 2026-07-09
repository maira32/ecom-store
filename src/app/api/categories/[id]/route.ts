import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Category from '@/models/Category';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await connectDB();
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deleted }, { status: 200 });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, message: "Failed to delete category" }, { status: 500 });
  }
}