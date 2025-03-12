// app/api/user/exists/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from "@/lib/mongodb";
import User from '@/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    
    // Connect to MongoDB
    await connectToDatabase();
    
    // Check if user exists
    const user = await User.findOne({ email });
    
    return NextResponse.json({ exists: !!user });
    
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
  }
}