// app/blog/page.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { getPublishedPosts } from "@/app/actions/client/blog-actions";
import { getCategories } from "@/app/actions/dashboard/category/category-actions";
import { CldImage } from "next-cloudinary";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { ReadOnlyEditor } from "@/components/read-only-editor";

// Force fresh data
export const dynamic = 'force-dynamic';

type Post = Awaited<ReturnType<typeof getPublishedPosts>>[0];
type Category = Awaited<ReturnType<typeof getCategories>>[0];

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = await getPublishedPosts(category || undefined);
  const categories = await getCategories();

  if (posts.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">No posts found</h1>
        <p className="text-muted-foreground">Check back later for new content.</p>
      </div>
    );
  }

  const featuredPost = posts[0];
  const carouselPosts = posts.slice(1, 5); // Next 4 for slider
  const gridPosts = posts.slice(1); // All except featured for grid

  return (
    <>
      {/* Hero: Featured Post */}
      <section className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
        <Link href={`/blog/${featuredPost.slug}`} className="block h-full">
          {featuredPost.featuredImage ? (
            <CldImage
              src={featuredPost.featuredImage}
              alt={featuredPost.title}
              fill
              className="object-cover brightness-75 transition-transform duration-700 hover:scale-105"
              sizes="100vw"
              priority
            />
          ) : (
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="container absolute bottom-0 left-0 right-0 pb-12 text-white">
            <Badge variant="secondary" className="mb-4">
              {featuredPost.category?.name || "Uncategorized"}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 line-clamp-3">
              {featuredPost.title}
            </h1>
            <p className="text-lg md:text-xl max-w-3xl line-clamp-2 opacity-90 mb-6">
              {featuredPost?.excerpt? featuredPost.excerpt : "Read the latest featured article"}
            </p>

            <div className="flex items-center gap-6 text-sm opacity-90">
              <span className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {featuredPost.author?.name || "Anonymous"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {format(new Date(featuredPost.createdAt), "MMMM d, yyyy")}
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* Carousel: Recent Posts Slider */}
      {carouselPosts.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8">Recent Articles</h2>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {carouselPosts.map((post) => (
                <CarouselItem key={post.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <Link href={`/blog/${post.slug}`}>
                    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                      {post.featuredImage ? (
                        <CldImage
                          src={post.featuredImage}
                          alt={post.title}
                          width={600}
                          height={400}
                          crop="fill"
                          className="object-cover"
                        />
                      ) : (
                        <div className="bg-gray-200 h-48" />
                      )}
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">
                          {post.category?.name || "General"}
                        </Badge>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
      )}

      {/* Main Content + Sidebar */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Blog Grid */}
          <div className="lg:col-span-3">
            <h2 className="text-3xl font-bold mb-8">All Posts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridPosts.map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.id}>
                  <Card className="h-full hover:shadow-lg transition-shadow overflow-hidden">
                    {post.featuredImage ? (
                      <CldImage
                        src={post.featuredImage}
                        alt={post.title}
                        width={400}
                        height={300}
                        crop="fill"
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-gray-200 h-48" />
                    )}
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3">
                        {post.category?.name || "General"}
                      </Badge>
                      <h3 className="font-bold text-xl mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {post.author?.name || "Anonymous"}
                        </span>
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(post.createdAt), "MMM d, yyyy")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-xl mb-6">Categories</h3>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/blog"
                      className={`block py-2 px-4 rounded-lg transition-colors ${
                        !category ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      All Posts ({posts.length})
                    </Link>
                  </li>
                  {categories.map((cat) => {
                    const count = posts.filter((p) => p.category?.id === cat.id).length;
                    return (
                      <li key={cat.id}>
                        <Link
                          href={`/blog?category=${cat.id}`}
                          className={`block py-2 px-4 rounded-lg transition-colors ${
                            category === cat.id
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-accent"
                          }`}
                        >
                          {cat.name} ({count})
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </aside>
        </div>
      </section>
    </>
  );
}