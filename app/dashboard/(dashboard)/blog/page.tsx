// app/dashboard/blog/page.tsx (Server Component)
import { getAllPosts } from "@/app/actions/dashboard/blog/blog-actions";
import BlogTableClient from "./components/blog-table-client";

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts and articles
          </p>
        </div>
      </div>

      <BlogTableClient initialPosts={posts} />
    </div>
  );
}