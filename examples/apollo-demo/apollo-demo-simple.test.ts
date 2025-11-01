/**
 * @fileoverview Apolloデモの簡易動作検証テスト
 * 
 * GraphQLスキーマの生成のみをテストします。
 * 
 * @module examples/apollo-demo/apollo-demo-simple.test
 */

import { describe, it, expect } from "vitest";
import { orpcGraphQL } from "../../src/orpc-graphql.js";
import { router } from "../orpc-router.js";
import { graphql } from "graphql";

describe("Apollo Demo - Schema Generation", () => {
  it("should generate GraphQL schema compatible with Apollo Server", () => {
    const gql = orpcGraphQL(router);

    expect(gql.schema).toBeDefined();
    expect(gql.sdl).toContain("type Query");
    expect(gql.sdl).toContain("type Mutation");
    expect(gql.sdl).toContain("getUser");
    expect(gql.sdl).toContain("createUser");
  });

  it("should execute GraphQL query directly", async () => {
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
    expect(result.data?.getUser).toEqual({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
    });
  });

  it("should execute GraphQL mutation directly", async () => {
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
    expect(result.data?.createUser).toEqual({
      id: "123",
    });
  });
});

