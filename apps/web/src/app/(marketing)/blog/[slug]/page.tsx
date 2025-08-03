import Image from "next/image";
import { notFound } from "next/navigation";

import { Prose } from "@/components/prose";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { getSinglePost, processHtmlContent } from "@/lib/blog-query";
import {
  delayedTransitionVariants,
  transitionVariants,
} from "@/lib/transitions";

export const revalidate = 2700;

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;

  const { post } = await getSinglePost(slug);

  if (!post) {
    return notFound();
  }

  const html = await processHtmlContent(post.content);

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
                    <time dateTime={post.publishedAt.toString()}>
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
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
                        <Image
                          src={author.image}
                          alt={author.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
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
                  <Prose html={html} className="max-w-3xl" />
                </AnimatedGroup>

                {post.attribution && (
                  <div className="mt-8 rounded-lg bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground">
                      Attribution:{" "}
                      <a
                        href={post.attribution.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {post.attribution.author}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </article>
          </AnimatedGroup>
        </div>
      </main>
    </div>
  );
}
