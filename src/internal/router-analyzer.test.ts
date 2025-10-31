/**
 * @fileoverview router-analyzerのテスト
 * 
 * @module internal/router-analyzer.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { analyzeRouter, createGraphQLFieldConfig } from "./router-analyzer.js";
import { OrpcRouter, OrpcProcedure } from "./types.js";

describe("analyzeRouter", () => {
  it("should extract procedures from flat router", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { kind: "query" },
          handler: async () => ({ id: "1" }),
        },
        createUser: {
          input: z.object({ name: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { kind: "mutation" },
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const procedures = analyzeRouter(router);
    expect(procedures).toHaveLength(2);
    expect(procedures[0].name).toBe("getUser");
    expect(procedures[0].isQuery).toBe(true);
    expect(procedures[1].name).toBe("createUser");
    expect(procedures[1].isQuery).toBe(false);
  });

  it("should extract procedures from nested router", () => {
    const router: OrpcRouter = {
      procedures: {
        user: {
          procedures: {
            get: {
              input: z.object({ id: z.string() }),
              output: z.object({ id: z.string() }),
              meta: { kind: "query" },
              handler: async () => ({ id: "1" }),
            },
            create: {
              input: z.object({ name: z.string() }),
              output: z.object({ id: z.string() }),
              meta: { kind: "mutation" },
              handler: async () => ({ id: "1" }),
            },
          },
        },
      },
    };

    const procedures = analyzeRouter(router);
    expect(procedures).toHaveLength(2);
    expect(procedures[0].name).toBe("user_get");
    expect(procedures[1].name).toBe("user_create");
  });

  it("should use custom isQueryFn", () => {
    const router: OrpcRouter = {
      procedures: {
        custom: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const procedures = analyzeRouter(router, {
      isQueryFn: () => true,
    });
    expect(procedures[0].isQuery).toBe(true);
  });

  it("should handle router without procedures", () => {
    const router: OrpcRouter = {
      procedures: {},
    };

    const procedures = analyzeRouter(router);
    expect(procedures).toHaveLength(0);
  });

  it("should handle router with null procedures", () => {
    const router: OrpcRouter = {};

    const procedures = analyzeRouter(router);
    expect(procedures).toHaveLength(0);
  });

  it("should classify query by GET method", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { method: "GET" },
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const procedures = analyzeRouter(router);
    expect(procedures[0].isQuery).toBe(true);
  });

  it("should default to mutation when no meta", () => {
    const router: OrpcRouter = {
      procedures: {
        createUser: {
          input: z.object({ name: z.string() }),
          output: z.object({ id: z.string() }),
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const procedures = analyzeRouter(router);
    expect(procedures[0].isQuery).toBe(false);
  });
});

describe("createGraphQLFieldConfig", () => {
  it("should create field config from procedure", () => {
    const procedure: OrpcProcedure = {
      input: z.object({ id: z.string() }),
      output: z.object({ id: z.string(), name: z.string() }),
      meta: { kind: "query" },
      handler: async ({ input }) => ({
        id: input.id,
        name: "Test",
      }),
    };

    const analyzed = {
      name: "getUser",
      procedure,
      isQuery: true,
      fieldConfig: {} as any,
    };

    const result = createGraphQLFieldConfig(analyzed);
    expect(result.fieldConfig.type).toBeDefined();
    expect(result.fieldConfig.args).toBeDefined();
    expect(result.fieldConfig.resolve).toBeDefined();
  });
});

