import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeParse from "rehype-parse";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";
import { env } from "@repo/env/server";

import type {
  MarbleAuthorList,
  MarbleCategoryList,
  MarblePost,
  MarblePostList,
  MarbleTagList,
} from "@/types/post";

async function fetchFromMarble<T>(endpoint: string): Promise<T> {
  try {
    const response = await fetch(
      `${env.MARBLE_API_URL}/${env.MARBLE_WORKSPACE_KEY}/${endpoint}`,
    );
    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`,
      );
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

export async function getPosts() {
  return fetchFromMarble<MarblePostList>("posts");
}

export async function getTags() {
  return fetchFromMarble<MarbleTagList>("tags");
}

export async function getSinglePost(slug: string) {
  return fetchFromMarble<MarblePost>(`posts/${slug}`);
}

export async function getCategories() {
  return fetchFromMarble<MarbleCategoryList>("categories");
}

export async function getAuthors() {
  return fetchFromMarble<MarbleAuthorList>("authors");
}

export async function processHtmlContent(html: string): Promise<string> {
  const processor = unified()
    .use(rehypeSanitize)
    .use(rehypeParse, { fragment: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, { behavior: "append" })
    .use(rehypeStringify);

  const file = await processor.process(html);
  return String(file);
}
