/**
 * @fileoverview 基本的な使用例
 * 
 * oRPC GraphQL Gatewayの基本的な使用方法を示します。
 * 
 * @module examples/basic-usage
 */

import { z } from "zod";
import { orpcGraphQL } from "../src/orpc-graphql.js";
import type { OrpcRouter, OrpcProcedure } from "../src/internal/types.js";

// 1. oRPC routerの定義
const router: OrpcRouter = {
  procedures: {
    getUser: {
      input: z.object({ id: z.string() }),
      output: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
      meta: { kind: "query" },
      handler: async ({ input }) => {
        // 実際の実装
        return {
          id: input.id,
          name: "John Doe",
          email: "john@example.com",
        };
      },
    } as OrpcProcedure,

    createUser: {
      input: z.object({
        name: z.string(),
        email: z.string().email(),
      }),
      output: z.object({ id: z.string() }),
      meta: { kind: "mutation" },
      handler: async ({ input }) => {
        // 実際の実装
        return { id: "123" };
      },
    } as OrpcProcedure,
  },
};

// 2. GraphQL Gatewayの生成
const gql = orpcGraphQL(router);

// 3. GraphQL SchemaとSDLの取得
console.log("GraphQL Schema:", gql.schema);
console.log("GraphQL SDL:\n", gql.sdl);

// 4. HTTPハンドラの作成（Next.jsなどで使用）
const handler = gql.createHandler();

export { router, gql, handler };

