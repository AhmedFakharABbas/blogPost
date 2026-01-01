// app/actions/blog-actions.ts
"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/Post";
import { revalidatePath, revalidateTag } from "next/cache";
import { postSchema } from "@/lib/validation";
import mongoose from "mongoose";

export async function createPost(data: any) {
  await connectToDatabase();
  const validated = postSchema.safeParse(data);
  if (!validated.success) {
    throw new Error(validated.error.issues[0].message);
  }
  await Post.create({
    title: validated.data.title,
    slug: validated.data.slug,
    content: validated.data.content,
    published: validated.data.published ?? false,
    categoryId: validated.data.categoryId || null,
    authorId: validated.data.authorId,
    featuredImage: validated.data.featuredImage || null,
  });
  revalidatePath("/dashboard/blog");
  revalidatePath("/blog");
  return {
    success: true,
    message: "Post created successfully",
  };
}
// Helper to safely serialize dates
function serializeDate(date: any): Date {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return new Date();
    return dateObj;
  } catch {
    return new Date();
  }
}

export async function getAllPosts() {
  try {
    await connectToDatabase();
    const posts = await Post.find({})
      .populate("authorId", "name email")
      .populate("categoryId", "id name")
      .sort({ createdAt: -1 })
      .lean();

    return posts.map((post) => ({
      id: post._id.toString(),
      title: post.title,
      slug: post.slug,
      content: post.content,
      published: post.published,
      featuredImage: post.featuredImage || null,
      categoryId: post.categoryId
        ? typeof post.categoryId === "object"
          ? post.categoryId._id.toString()
          : post.categoryId.toString()
        : null,
      category:
        post.categoryId && typeof post.categoryId === "object"
          ? {
              id: post.categoryId._id.toString(),
              name: post.categoryId.name,
            }
          : null,
      authorId: post.authorId
        ? typeof post.authorId === "object"
          ? post.authorId._id.toString()
          : post.authorId.toString()
        : null,
      author:
        post.authorId && typeof post.authorId === "object"
          ? {
              id: post.authorId._id.toString(),
              name: post.authorId.name,
              email: post.authorId.email,
            }
          : null,
      createdAt: serializeDate(post.createdAt),
      updatedAt: serializeDate(post.updatedAt),
    }));
  } catch (error: any) {
    console.error('Error fetching all posts:', error);
    throw new Error(`Failed to fetch posts: ${error?.message || 'Unknown error'}`);
  }
}

export async function deletePost(id: string) {
  await connectToDatabase();
  const post = await Post.findById(id).lean();
  const categoryId = post?.categoryId?.toString();
  
  await Post.findByIdAndDelete(id);
  
  // Revalidate paths
  revalidatePath("/dashboard/blog");
  revalidatePath("/blog");
  
  // Revalidate cache tags to immediately update published posts
  revalidateTag("posts");
  revalidateTag("all-posts");
  if (categoryId) {
    revalidateTag(`category-${categoryId}`);
  }
  // No redirect needed here – list stays on same page
}

export async function togglePublished(id: string, published: boolean) {
  await connectToDatabase();
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  
  const categoryId = post.categoryId?.toString();
  
  // Update published status - this will trigger timestamps automatically
  post.published = !published;
  await post.save();
  
  // Revalidate paths
  revalidatePath("/dashboard/blog");
  revalidatePath("/blog");
  
  // Revalidate cache tags to immediately update published posts
  revalidateTag("posts");
  revalidateTag("all-posts");
  if (categoryId) {
    revalidateTag(`category-${categoryId}`);
  }
}

export async function bulkUpdatePostDates(postIds: string[]) {
  let categoryIds = new Set<string>();
  
  try {
    await connectToDatabase();
    const now = new Date();
    
    if (!postIds || postIds.length === 0) {
      throw new Error('No post IDs provided');
    }

    // Validate and convert string IDs to ObjectIds with error handling
    const objectIds: any[] = [];
    for (const id of postIds) {
      try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          throw new Error(`Invalid post ID: ${id}`);
        }
        objectIds.push(new mongoose.Types.ObjectId(id));
      } catch (idError: any) {
        console.error(`Invalid post ID: ${id}`, idError);
        throw new Error(`Invalid post ID format: ${id}`);
      }
    }

    if (objectIds.length === 0) {
      throw new Error('No valid post IDs provided');
    }

    // Get categories of posts before update for cache invalidation
    try {
      const updatedPosts = await Post.find({ _id: { $in: objectIds } })
        .select("categoryId")
        .lean();
      
      categoryIds = new Set(
        updatedPosts
          .map(p => p.categoryId)
          .filter(Boolean)
          .map(cat => typeof cat === 'object' && cat._id ? cat._id.toString() : cat.toString())
      );
    } catch (findError: any) {
      console.error('Error fetching posts for cache invalidation:', findError);
      // Continue with update even if category fetch fails
    }

    // Use updateMany with $set - bypass Mongoose's timestamp middleware for this specific operation
    // This directly updates the database without triggering timestamps: true middleware
    let result;
    try {
      result = await Post.collection.updateMany(
        { _id: { $in: objectIds } },
        { $set: { createdAt: now, updatedAt: now } }
      );
    } catch (updateError: any) {
      console.error('Error updating posts in database:', updateError);
      throw new Error(`Database update failed: ${updateError?.message || 'Unknown error'}`);
    }

    // Revalidate all relevant paths - do this even if there were partial errors
    try {
      revalidatePath("/dashboard/blog");
      revalidatePath("/blog");
      revalidatePath("/", "layout");
    } catch (revalidatePathError: any) {
      console.error('Error revalidating paths:', revalidatePathError);
      // Continue with cache tag invalidation
    }
    
    // Invalidate all cache tags for posts - critical for instant cache updates
    try {
      revalidateTag("posts");
      revalidateTag("all-posts");
      
      // Invalidate category-specific tags
      for (const catId of categoryIds) {
        revalidateTag(`category-${catId}`);
      }
    } catch (revalidateTagError: any) {
      console.error('Error revalidating cache tags:', revalidateTagError);
      // Still return success if database update succeeded
    }
    
    return {
      success: true,
      updatedCount: result.modifiedCount,
      message: `Updated ${result.modifiedCount} post(s) date to now`,
    };
  } catch (error: any) {
    console.error('Error bulk updating post dates:', error);
    
    // Still try to invalidate cache even on error, as some posts might have been updated
    try {
      revalidateTag("posts");
      revalidateTag("all-posts");
      for (const catId of categoryIds) {
        revalidateTag(`category-${catId}`);
      }
      revalidatePath("/dashboard/blog");
      revalidatePath("/blog");
    } catch (cacheError) {
      console.error('Error invalidating cache after failure:', cacheError);
    }
    
    throw new Error(`Failed to update post dates: ${error?.message || 'Unknown error'}`);
  }
}