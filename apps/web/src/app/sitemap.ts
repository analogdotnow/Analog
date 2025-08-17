import type { MetadataRoute } from "next";

// import { getPosts } from "@/lib/blog-query";
import { URLS } from "@/lib/urls";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // const data = await getPosts();

  // const postPages: MetadataRoute.Sitemap =
  //   data?.posts?.map((post) => ({
  //     url: `${URLS.SITE}/blog/${post.slug}`,
  //     lastModified: new Date(post.publishedAt),
  //     changeFrequency: "monthly",
  //     priority: 0.8,
  //   })) ?? [];

  return [
    {
      url: URLS.SITE,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${URLS.SITE}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${URLS.SITE}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${URLS.SITE}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${URLS.SITE}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    // ...postPages,
  ];
}
