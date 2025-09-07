import { createOpenAPI } from 'fumadocs-openapi/server';
import { openApiDocument } from '@repo/api/openapi';

export const openapi = createOpenAPI({
  async input() {
    return {
      // [id]: downloaded OpenAPI Schema
      my_schema: await fetch(
        'http://localhost:3000/api/openapi.json',
      ).then((res) => res.json()),
    };
  },
});

import { generateFiles } from "fumadocs-openapi";
void generateFiles({
  // the OpenAPI schema, you can also give it an external URL.
  input: ["http://localhost:3000/api/openapi.json"],
  output: "./content/docs/router",
  // we recommend to enable it
  // make sure your endpoint description doesn't break MDX syntax.
  includeDescription: true,
});

console.log(JSON.stringify(openapi.getSchemas(), null, 2));