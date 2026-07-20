import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Message from '@/models/Message';
import User from '@/models/User';
import { createNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, message } = body; 

    if (!fullName || !email || !message) {
      return NextResponse.json({ success: false, message: "All fields are required." }, { status: 400 });
    }

    await connectDB();
    
    const newMessage = await Message.create({
      fullName, 
      email,
      message
    });

    const admins = await User.find({ role: 'admin' }).select('_id');
    await Promise.all(
      admins.map((admin) =>
        createNotification(
          admin._id.toString(),
          'New message',
          `${fullName} sent a message`,
          '/dashboard/messages'
        )
      )
    );

    return NextResponse.json({ success: true, message: "Message sent successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}