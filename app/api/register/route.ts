// app/api/register/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs'; // Use bcryptjs to match login route

export async function POST(request: Request) {
  try {
    await connectToDatabase();

    // Parse request body
    const { name, email, password } = await request.json();

    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists using Mongoose
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 } // Conflict
      );
    }

    // Hash the password using bcryptjs (must match login route)
    const saltRounds = 12; // Recommended strength
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user using Mongoose
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user', // default role
    });

    // Convert to plain object and remove password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: userResponse._id.toString(),
          name: userResponse.name,
          email: userResponse.email,
          role: userResponse.role,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);

    // Handle Mongoose duplicate key error (duplicate email)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}