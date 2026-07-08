import { NextResponse } from 'next/server';

export async function GET() {
  
  const dummyData = [
    { id: "1", name: "Matte Black Watch", price: 120.00 },
    { id: "2", name: "Ceramic Pour-over", price: 45.00 }
  ];

  return NextResponse.json({ success: true, data: dummyData }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
   
    return NextResponse.json(
      { success: true, message: "Product created successfully (Mock)", data: body }, 
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to create product" }, 
      { status: 500 }
    );
  }
}