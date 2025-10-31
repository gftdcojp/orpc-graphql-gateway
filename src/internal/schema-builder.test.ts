/**
 * @fileoverview GraphQL schema生成のテスト
 * 
 * @module internal/schema-builder.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { buildGraphQLSchemaFromOrpc } from "./schema-builder.js";
import { OrpcRouter } from "./types.js";

describe("buildGraphQLSchemaFromOrpc", () => {
  it("should build GraphQL schema from simple router", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({
            id: z.string(),
            name: z.string(),
          }),
          meta: { kind: "query" },
          handler: async ({ input }) => ({
            id: input.id,
            name: "Test",
          }),
        },
      },
    };

    const schema = buildGraphQLSchemaFromOrpc(router);
    expect(schema).toBeDefined();
    expect(schema.getQueryType()).toBeDefined();
    expect(schema.getQueryType()?.getFields()).toHaveProperty("getUser");
  });

  it("should separate queries and mutations", () => {
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

    const schema = buildGraphQLSchemaFromOrpc(router);
    expect(schema.getQueryType()?.getFields()).toHaveProperty("getUser");
    expect(schema.getMutationType()?.getFields()).toHaveProperty("createUser");
  });

  it("should handle nested routers", () => {
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
          },
        },
      },
    };

    const schema = buildGraphQLSchemaFromOrpc(router);
    expect(schema.getQueryType()?.getFields()).toHaveProperty("user_get");
  });
});

