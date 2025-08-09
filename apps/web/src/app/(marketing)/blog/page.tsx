import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { getPosts } from "@/lib/blog-query";
import { transitionVariants } from "@/lib/transitions";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Blog, Updates & News - Analog",
};

export default async function BlogPage() {
  const { posts } = await getPosts();

  return (
    <div className="min-h-[calc(100vh-8rem)] py-20 sm:py-28 md:py-32 lg:py-40">
      <main className="flex w-full flex-col items-center justify-center gap-8 md:gap-12">
        <div className="flex w-full max-w-6xl flex-col gap-12 overflow-hidden md:gap-16">
          <AnimatedGroup variants={transitionVariants}>
            <div className="flex flex-col gap-12 px-4 md:px-6">
              <div className="flex flex-col items-center justify-center gap-3 text-center md:gap-6">
                <h1 className="font-satoshi text-4xl leading-tight md:text-5xl lg:text-6xl">
                  Blog, Updates & News
                </h1>
                <p className="max-w-xl text-base text-muted-foreground md:text-lg">
                  Stay up to date with the latest news and updates from Analog.
                </p>
              </div>
            </div>
          </AnimatedGroup>

          <AnimatedGroup
            variants={{
              container: {
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                    delayChildren: 0.25,
                  },
                },
              },
              ...transitionVariants,
            }}
          >
            {posts.length === 0 ? (
              <div className="flex w-full items-center justify-center">
                <p className="text-center text-muted-foreground">
                  No blog posts found.
                </p>
              </div>
            ) : (
              <div className="w-full px-4 md:px-6">
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <article
                      key={post.id}
                      className="group relative flex h-full flex-col overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        className="flex h-full flex-col"
                      >
                        {post.coverImage ? (
                          <div className="relative h-48 w-full overflow-hidden">
                            <Image
                              src={post.coverImage}
                              alt={post.title}
                              fill
                              className="object-cover transition-transform group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="h-48 w-full bg-gradient-to-br from-primary/20 to-primary/5" />
                        )}

                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {post.category.name}
                            </span>
                            <span>•</span>
                            <time dateTime={post.publishedAt.toString()}>
                              {new Date(post.publishedAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                },
                              )}
                            </time>
                          </div>

                          <h2 className="mt-3 text-xl font-semibold tracking-tight group-hover:text-primary">
                            {post.title}
                          </h2>

                          {post.description && (
                            <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                              {post.description}
                            </p>
                          )}

                          <div className="mt-auto flex items-center justify-between pt-4">
                            <div className="flex items-center gap-2">
                              {post.authors.slice(0, 2).map((author) => (
                                <Image
                                  key={author.id}
                                  src={author.image}
                                  alt={author.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                              ))}
                              {post.authors.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  {post.authors[0]?.name}
                                  {post.authors.length > 1 &&
                                    ` +${post.authors.length - 1}`}
                                </span>
                              )}
                            </div>

                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {post.tags.slice(0, 2).map((tag) => (
                                  <span
                                    key={tag.id}
                                    className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                                  >
                                    {tag.name}
                                  </span>
                                ))}
                                {post.tags.length > 2 && (
                                  <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                                    +{post.tags.length - 2}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </AnimatedGroup>
        </div>
      </main>
    </div>
  );
}
