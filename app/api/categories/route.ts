// app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Category from '@/models/Category';
import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';
// import { getUserFromToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// Helper to get authenticated user
async function getAuthUser() {
//   const token = cookies().get('token')?.value;
//   return getUserFromToken(token);
return true;
}

// GET: List all categories - Optimized with caching

async function _getCategoriesAPI() {
  await connectToDatabase();
  const categories = await Category.find({})
    .select('_id name') // Only select needed fields
    .sort({ name: 1 })
    .lean();
  return categories.map(cat => ({
    id: cat._id.toString(),
    name: cat.name,
  }));
}

// Cache API responses for better performance
const getCachedCategories = unstable_cache(
  _getCategoriesAPI,
  ['categories-api'],
  {
    revalidate: 3600, // Cache for 1 hour
    tags: ['categories'],
  }
);

export async function GET() {
  try {
    const categories = await getCachedCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
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