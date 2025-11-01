/**
 * @fileoverview GraphQL Code Generator設定例
 * 
 * GraphQLスキーマからTypeScriptの型を生成するための設定です。
 * 
 * @module examples/apollo-demo/codegen
 */

import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  schema: "http://localhost:4000",
  documents: ["src/**/*.{ts,tsx}"],
  generates: {
    "./src/generated/graphql.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withComponent: false,
        withHOC: false,
      },
    },
  },
};

export default config;

