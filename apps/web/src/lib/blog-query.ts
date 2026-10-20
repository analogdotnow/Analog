import { cache } from "react";
import { notFound } from "next/navigation";
import { Marble } from "@usemarble/sdk";
import type { Post } from "@usemarble/sdk/models";
import { NotFoundError } from "@usemarble/sdk/models/errors";

import { env } from "@repo/env/server";

export const getPosts = cache(async (): Promise<Post[]> => {
  if (!env.MARBLE_API_KEY) return [];

  const pages = await new Marble({ apiKey: env.MARBLE_API_KEY }).posts.list({
    limit: 100,
  });
  const posts: Post[] = [];
  for await (const page of pages) posts.push(...page.result.posts);
  return posts;
});

export const getSinglePost = cache(async (slug: string): Promise<Post> => {
  if (!env.MARBLE_API_KEY) notFound();

  try {
    const { post } = await new Marble({ apiKey: env.MARBLE_API_KEY }).posts.get(
      {
        identifier: slug,
      },
    );
    return post;
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }
});
