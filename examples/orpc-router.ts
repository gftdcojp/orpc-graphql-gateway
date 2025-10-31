/**
 * @fileoverview oRPC router定義例
 * 
 * このファイルは `src/server/orpc.ts` に配置します。
 * 
 * @module examples/orpc-router
 */

import { z } from "zod";
import type { OrpcRouter, OrpcProcedure } from "../src/internal/types.js";

export const router: OrpcRouter = {
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

