import { cache } from "react";

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
      console.warn(
        `Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`,
      );

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

export const getPosts = cache(async () => {
  try {
    return fetchFromMarble<MarblePostList>("posts");
  } catch (error) {
    console.error("Failed to fetch posts", error);
    return [];
  }
});

export const getTags = cache(async () => {
  try {
    return fetchFromMarble<MarbleTagList>("tags");
  } catch (error) {
    console.warn("Failed to fetch tags", error);
    return [];
  }
});

export const getSinglePost = cache(async (slug: string) => {
  try {
    return fetchFromMarble<MarblePost>(`posts/${slug}`);
  } catch (error) {
    console.warn("Failed to fetch single post", error);
    return null;
  }
});

export const getCategories = cache(async () => {
  try {
    return fetchFromMarble<MarbleCategoryList>("categories");
  } catch (error) {
    console.warn("Failed to fetch categories", error);
    return [];
  }
});

export const getAuthors = cache(async () => {
  try {
    return fetchFromMarble<MarbleAuthorList>("authors");
  } catch (error) {
    console.warn("Failed to fetch authors", error);
    return [];
  }
});
