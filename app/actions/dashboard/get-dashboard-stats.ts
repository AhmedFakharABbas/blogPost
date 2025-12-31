"use server";

import { connectToDatabase } from "@/lib/mongodb";
import Post from "@/models/Post";
import Category from "@/models/Category";
import User from "@/models/User";

export async function getDashboardStats() {
  try {
    await connectToDatabase();

    // Fetch all stats in parallel for better performance
    const [
      totalPosts,
      publishedPosts,
      draftPosts,
      totalCategories,
      totalUsers,
      recentPosts,
    ] = await Promise.all([
      Post.countDocuments({}),
      Post.countDocuments({ published: true }),
      Post.countDocuments({ published: false }),
      Category.countDocuments({}),
      User.countDocuments({}),
      Post.find({})
        .select("title slug published createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return {
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: draftPosts,
      },
      categories: {
        total: totalCategories,
      },
      users: {
        total: totalUsers,
      },
      recentPosts: recentPosts.map((post) => ({
        id: post._id.toString(),
        title: post.title,
        slug: post.slug,
        published: post.published,
        createdAt: post.createdAt,
      })),
    };
  } catch (error: any) {
    console.error("Error fetching dashboard stats:", error);
    // Return default values on error
    return {
      posts: {
        total: 0,
        published: 0,
        draft: 0,
      },
      categories: {
        total: 0,
      },
      users: {
        total: 0,
      },
      recentPosts: [],
    };
  }
}

