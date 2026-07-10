import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email });

    const genericResponse = NextResponse.json(
      { message: "If an account exists for that email, a reset link has been sent." },
      { status: 200 }
    );

    if (!user) {
      return genericResponse;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password/${rawToken}`;
    await sendPasswordResetEmail(user.email, resetUrl);

    return genericResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}