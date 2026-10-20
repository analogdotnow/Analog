import type { Metadata } from "next";
import Image from "next/image";

import { Prose } from "@/components/prose";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { getPosts, getSinglePost } from "@/lib/blog-query";
import {
  delayedTransitionVariants,
  transitionVariants,
} from "@/lib/transitions";

export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const slug = (await params).slug;

  const post = await getSinglePost(slug);

  return {
    title: `${post.title} - Analog`,
    description: post.description,
    twitter: {
      title: `${post.title} - Analog`,
      description: post.description,
      card: "summary_large_image",
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    openGraph: {
      title: `${post.title} - Analog`,
      description: post.description,
      type: "article",
      images: post.coverImage ? [post.coverImage] : undefined,
      publishedTime: post.publishedAt.toISOString(),
      authors: post.authors.map((author) => author.name),
    },
  };
}

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const slug = (await params).slug;

  const post = await getSinglePost(slug);

  return (
    <div className="min-h-[calc(100vh-8rem)] py-20 sm:py-28 md:py-32 lg:py-40">
      <main className="flex w-full flex-col items-center justify-center gap-8 md:gap-12">
        <div className="flex w-full max-w-4xl flex-col gap-12 overflow-hidden px-4 md:gap-16 md:px-6">
          <AnimatedGroup variants={transitionVariants}>
            <article className="flex w-full flex-col items-start justify-start gap-8 md:gap-12">
              {post.coverImage && (
                <div className="relative h-64 w-full overflow-hidden rounded-lg sm:h-80 md:h-96">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              <div className="w-full space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {post.category.name}
                    </span>
                    <span>•</span>
                    <time dateTime={post.publishedAt.toISOString()}>
                      {post.publishedAt.toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </div>

                  <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                    {post.title}
                  </h1>

                  {post.description && (
                    <p className="text-lg text-muted-foreground sm:text-xl">
                      {post.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4">
                    {post.authors.map((author) => (
                      <div key={author.id} className="flex items-center gap-2">
                        {author.image && (
                          <Image
                            src={author.image}
                            alt={author.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        )}
                        <span className="text-sm font-medium">
                          {author.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="h-px bg-border" />
                <AnimatedGroup variants={delayedTransitionVariants}>
                  <Prose html={post.content} className="max-w-3xl" />
                </AnimatedGroup>
              </div>
            </article>
          </AnimatedGroup>
        </div>
      </main>
    </div>
  );
}
