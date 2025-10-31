/**
 * @fileoverview router-analyzerのカバレッジテスト
 * 
 * @module internal/router-analyzer-coverage.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { analyzeRouter } from "./router-analyzer.js";
import { OrpcRouter } from "./types.js";

describe("analyzeRouter - coverage", () => {
  it("should handle mixed router and procedure", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { kind: "query" },
          handler: async () => ({ id: "1" }),
        },
        user: {
          procedures: {
            get: {
              input: z.object({ id: z.string() }),
              output: z.object({ id: z.string() }),
              meta: { kind: "query" },
              handler: async () => ({ id: "1" }),
            },
          },
        },
        invalid: "not-a-procedure-or-router" as any,
      },
    };

    const procedures = analyzeRouter(router);
    // getUserとuser_getが抽出される
    expect(procedures.length).toBeGreaterThanOrEqual(2);
  });
});

