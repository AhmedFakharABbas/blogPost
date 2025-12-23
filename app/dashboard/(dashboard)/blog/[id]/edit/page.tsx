// app/dashboard/blog/[id]/edit/page.tsx (Server Component)
import { getPostById } from "@/app/actions/create-post";
import { getUsers } from "@/app/actions/users/get-users";
import { getCategories } from "@/app/actions/dashboard/category/category-actions";
import EditBlogForm from "./edit-blog-form";
import { notFound } from "next/navigation";

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  try {
    const [post, users, categories] = await Promise.all([
      getPostById(id),
      getUsers(),
      getCategories(),
    ]);

    return (
      <EditBlogForm
        post={post}
        users={users}
        categories={categories}
      />
    );
  } catch (error) {
    notFound();
  }
}
