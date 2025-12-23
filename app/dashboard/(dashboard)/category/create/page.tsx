// app/dashboard/category/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateCategoryPage() {
  const [name, setName] = useState('');
  // const [slug, setSlug] = useState('');
  // const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create category');
      }

      setSuccess('Category created successfully!');
      setName('');
      // setSlug('');
      // setDescription('');

      // Optional: redirect to list page after 1 second
      setTimeout(() => {
        router.push('/dashboard/category');
      }, 1000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
                  disabled={loading}
                />
              </div>

              {/* <div>
                <Label htmlFor="slug">Slug (URL-friendly) *</Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  placeholder="e.g., technology"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Auto-generated from name. Edit if needed.
                </p>
              </div> */}

              {/* <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description of this category..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div> */}

              {error && (
                <p className="text-red-600 text-sm font-medium">{error}</p>
              )}

              {success && (
                <p className="text-green-600 text-sm font-medium">{success}</p>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Category'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/category')}
                  disabled={loading}
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