// app/dashboard/category/create/page.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createCategory } from '@/app/actions/dashboard/category/category-actions';
import { toast } from 'sonner';

export default function CreateCategoryPage() {
  const [name, setName] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // // Auto-generate slug from name
  // const generateSlug = (input: string) => {
  //   return input
  //     .toLowerCase()
  //     .trim()
  //     .replace(/[^a-z0-9\s-]/g, '') // remove special chars
  //     .replace(/\s+/g, '-') // spaces to dashes
  //     .replace(/-+/g, '-'); // multiple dashes to single
  // };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    // setSlug(generateSlug(value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }

    startTransition(async () => {
      try {
        await createCategory({ name: name.trim() });
        toast.success('Category created successfully!');
        setName('');
        
        // Redirect to list page after a short delay
        setTimeout(() => {
          router.push('/dashboard/category');
        }, 500);
      } catch (err: any) {
        toast.error(err.message || 'Failed to create category');
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create New Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g., Technology"
                  required
                  disabled={isPending}
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? 'Creating...' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/category')}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}