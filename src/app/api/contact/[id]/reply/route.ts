import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Message from '@/models/Message';
import { sendContactReplyEmail } from '@/lib/email';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'admin') {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const { reply } = await request.json();

    if (!reply || !reply.trim()) {
      return NextResponse.json({ success: false, message: "Reply cannot be empty" }, { status: 400 });
    }

    await connectDB();
    
    // OPTIMIZATION: One trip to the DB. Find it, update 'isRead', select only needed fields, and lean it.
    const message = await Message.findByIdAndUpdate(
      id,
      { isRead: true }
    ).select('email fullName message').lean();

    if (!message) {
      return NextResponse.json({ success: false, message: "Message not found" }, { status: 404 });
    }

    // Now we send the email using the lightweight data we just grabbed
    await sendContactReplyEmail(message.email, message.fullName, message.message, reply.trim());

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Reply send error:", error);
    return NextResponse.json({ success: false, message: "Failed to send reply" }, { status: 500 });
  }
}