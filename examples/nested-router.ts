/**
 * @fileoverview ネストされたrouterの使用例
 * 
 * ネストされたoRPC routerをGraphQLに変換する例です。
 * 
 * @module examples/nested-router
 */

import { z } from "zod";
import { orpcGraphQL } from "../src/orpc-graphql.js";
import type { OrpcRouter, OrpcProcedure } from "../src/internal/types.js";

// ネストされたrouterの定義
const router: OrpcRouter = {
  procedures: {
    user: {
      procedures: {
        get: {
          input: z.object({ id: z.string() }),
          output: z.object({
            id: z.string(),
            name: z.string(),
          }),
          meta: { kind: "query" },
          handler: async ({ input }) => ({
            id: input.id,
            name: "John Doe",
          }),
        } as OrpcProcedure,

        create: {
          input: z.object({
            name: z.string(),
            email: z.string().email(),
          }),
          output: z.object({ id: z.string() }),
          meta: { kind: "mutation" },
          handler: async ({ input }) => ({
            id: "123",
          }),
        } as OrpcProcedure,
      },
    } as OrpcRouter,

    post: {
      procedures: {
        list: {
          input: z.object({
            limit: z.number().optional(),
            offset: z.number().optional(),
          }),
          output: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              content: z.string(),
            }),
          ),
          meta: { kind: "query" },
          handler: async ({ input }) => [
            {
              id: "1",
              title: "First Post",
              content: "Content here",
            },
          ],
        } as OrpcProcedure,
      },
    } as OrpcRouter,
  },
};

// GraphQL Gatewayの生成
const gql = orpcGraphQL(router);

console.log("GraphQL SDL:\n", gql.sdl);

export { router, gql };

