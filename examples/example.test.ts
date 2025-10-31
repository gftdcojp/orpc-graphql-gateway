/**
 * @fileoverview Example実装の動作検証テスト
 * 
 * @module examples/example.test
 */

import { describe, it, expect } from "vitest";
import { orpcGraphQL } from "../src/orpc-graphql.js";
import { router } from "./orpc-router.js";
import { graphql } from "graphql";

describe("Example Implementation", () => {
  it("should generate GraphQL schema from router", () => {
    const gql = orpcGraphQL(router);

    expect(gql.schema).toBeDefined();
    expect(gql.sdl).toBeDefined();
    expect(typeof gql.createHandler).toBe("function");
  });

  it("should execute GraphQL query", async () => {
    const gql = orpcGraphQL(router);

    const query = `
      query {
        getUser(id: "123") {
          id
          name
          email
        }
      }
    `;

    const result = await graphql({
      schema: gql.schema,
      source: query,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.getUser).toBeDefined();
    expect(result.data?.getUser.id).toBe("123");
    expect(result.data?.getUser.name).toBe("John Doe");
    expect(result.data?.getUser.email).toBe("john@example.com");
  });

  it("should execute GraphQL mutation", async () => {
    const gql = orpcGraphQL(router);

    const mutation = `
      mutation {
        createUser(name: "Jane Doe", email: "jane@example.com") {
          id
        }
      }
    `;

    const result = await graphql({
      schema: gql.schema,
      source: mutation,
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data?.createUser).toBeDefined();
    expect(result.data?.createUser.id).toBe("123");
  });

  it("should handle invalid input", async () => {
    const gql = orpcGraphQL(router);

    const query = `
      query {
        getUser(id: 123) {
          id
          name
          email
        }
      }
    `;

    const result = await graphql({
      schema: gql.schema,
      source: query,
    });

    expect(result.errors).toBeDefined();
  });

  it("should generate SDL with correct structure", () => {
    const gql = orpcGraphQL(router);

    expect(gql.sdl).toContain("type Query");
    expect(gql.sdl).toContain("type Mutation");
    expect(gql.sdl).toContain("getUser");
    expect(gql.sdl).toContain("createUser");
  });
});

