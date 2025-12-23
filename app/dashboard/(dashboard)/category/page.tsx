// app/dashboard/blog/categories/page.tsx

// 'use server';
import { getCategories } from "@/app/actions/dashboard/category/category-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Key, ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from "react";
import DeleteCategoryButton from "@/app/dashboard/(dashboard)/category/components/delete-button";

// Force dynamic rendering to prevent prerendering during build
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-muted-foreground">Manage your blog categories</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/category/create">Create Category</Link>
        </Button>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-muted-foreground">No categories yet.</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/category/create">Create First Category</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category: { id: Key | null | undefined; name: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }) => (
            <Card key={category.id}>
              <CardHeader>
                <CardTitle className="text-xl">{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/category/${category.id}`}>
                    Edit
                  </Link>
                </Button>
                <DeleteCategoryButton id={category.id as string} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}