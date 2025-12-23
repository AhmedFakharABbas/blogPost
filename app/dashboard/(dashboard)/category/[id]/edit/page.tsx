// app/dashboard/blog/categories/edit/[id]/page.tsx
import { getCategoryById} from "@/app/actions/dashboard/category/category-actions";
import EditCategoryForm from "@/app/dashboard/component/blog/categories/edit-form";
import { notFound } from "next/navigation";

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);

  if (!category) notFound();

  return <EditCategoryForm category={category} />;
}