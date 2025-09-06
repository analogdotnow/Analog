import { docs } from '@/.source';
import { loader } from 'fumadocs-core/source';
import { transformerOpenAPI } from 'fumadocs-openapi/server';

// See https://fumadocs.vercel.app/docs/headless/source-api for more info
export const source = loader({
  // it assigns a URL to your pages
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
  pageTree: {
    // adds a badge to each page item in page tree
    transformers: [transformerOpenAPI()],
  },
});

