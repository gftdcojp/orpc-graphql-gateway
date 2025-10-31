/**
 * @fileoverview orpcGraphQL関数のテスト
 * 
 * @module orpc-graphql.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import { orpcGraphQL } from "./orpc-graphql.js";
import { OrpcRouter } from "./internal/types.js";

describe("orpcGraphQL", () => {
  it("should create GraphQL gateway from router", () => {
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

    const gql = orpcGraphQL(router);

    expect(gql.schema).toBeDefined();
    expect(gql.sdl).toBeDefined();
    expect(typeof gql.sdl).toBe("string");
    expect(gql.sdl).toContain("type Query");
    expect(gql.createHandler).toBeDefined();
    expect(typeof gql.createHandler).toBe("function");
  });

  it("should generate SDL with query and mutation", () => {
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

    const gql = orpcGraphQL(router);

    expect(gql.sdl).toContain("type Query");
    expect(gql.sdl).toContain("type Mutation");
    expect(gql.sdl).toContain("getUser");
    expect(gql.sdl).toContain("createUser");
  });

  it("should support federation options", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { kind: "query" },
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const gql = orpcGraphQL(router, {
      federation: {
        enabled: true,
        keyBy: {
          User: "id",
        },
      },
    });

    expect(gql.subgraphSDL).toBeDefined();
    expect(typeof gql.subgraphSDL).toBe("string");
  });

  it("should create handler function", () => {
    const router: OrpcRouter = {
      procedures: {
        getUser: {
          input: z.object({ id: z.string() }),
          output: z.object({ id: z.string() }),
          meta: { kind: "query" },
          handler: async () => ({ id: "1" }),
        },
      },
    };

    const gql = orpcGraphQL(router);
    const handler = gql.createHandler();

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });
});

