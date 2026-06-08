import { defineConfig } from "oxfmt";

export default defineConfig({
  sortImports: {
    newlinesBetween: false,
    partitionByNewline: true,
    customGroups: [
      {
        groupName: "react",
        elementNamePattern: ["react", "react/**"],
      },
      {
        groupName: "next",
        elementNamePattern: ["next", "next/**"],
      },
      {
        groupName: "repo",
        elementNamePattern: ["@repo/**"],
      },
      {
        groupName: "alias",
        elementNamePattern: ["@/**"],
      },
    ],
    groups: [
      "builtin",
      "react",
      "next",
      "external",
      "repo",
      "alias",
      "parent",
      "sibling",
      "index",
      "style",
      "unknown",
    ],
  },
  sortTailwindcss: {
    stylesheet: "./apps/web/src/app/globals.css",
  },
  printWidth: 80,
  sortPackageJson: false,
  ignorePatterns: [
    "node_modules",
    ".next",
    "bun.lock",
    "bun.lockb",
    "routeTree.gen.ts",
  ],
});
