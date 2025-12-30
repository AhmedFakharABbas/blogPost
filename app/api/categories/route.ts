// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import { revalidatePath, revalidateTag } from 'next/cache';
// import { getUserFromToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to get authenticated user
async function getAuthUser() {
//   const token = cookies().get('token')?.value;
//   return getUserFromToken(token);
return true;
}

// GET: List all categories
export async function GET() {
  try {
    await connectToDatabase();
    const categories = await Category.find({}).sort({ name: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

// POST: Create new category (admin only or authenticated)
export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name and slug required' }, { status: 400 });
    }

    const category = await Category.create({ name });
    
    // Invalidate cache so categories show up immediately
    revalidatePath("/dashboard/category");
    revalidateTag("categories");
    
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Slug or name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}