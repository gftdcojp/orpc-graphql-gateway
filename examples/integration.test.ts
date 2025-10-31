/**
 * @fileoverview Example実装の統合テスト
 * 
 * 実際の使用例に基づいた統合テストです。
 * 
 * @module examples/integration.test
 */

import { describe, it, expect } from "vitest";
import { orpcGraphQL } from "../src/orpc-graphql.js";
import { router } from "./orpc-router.js";
import { graphql } from "graphql";

describe("Integration Tests", () => {
  describe("Basic Usage", () => {
    it("should create GraphQL gateway from router", () => {
      const gql = orpcGraphQL(router);

      expect(gql.schema).toBeDefined();
      expect(gql.sdl).toBeDefined();
      expect(typeof gql.createHandler).toBe("function");
    });

    it("should generate valid GraphQL SDL", () => {
      const gql = orpcGraphQL(router);

      // SDLの基本的な構造を確認
      expect(gql.sdl).toContain("type Query");
      expect(gql.sdl).toContain("type Mutation");
      expect(gql.sdl).toContain("getUser");
      expect(gql.sdl).toContain("createUser");
    });

    it("should create HTTP handler", () => {
      const gql = orpcGraphQL(router);
      const handler = gql.createHandler();

      expect(typeof handler).toBe("function");
    });
  });

  describe("GraphQL Query Execution", () => {
    it("should execute getUser query successfully", async () => {
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

    it("should execute getUser query with partial fields", async () => {
      const gql = orpcGraphQL(router);

      const query = `
        query {
          getUser(id: "123") {
            id
            name
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
      });
    });
  });

  describe("GraphQL Mutation Execution", () => {
    it("should execute createUser mutation successfully", async () => {
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

  describe("Input Validation", () => {
    it("should reject invalid input types", async () => {
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
      expect(result.errors?.[0]?.message).toContain("String");
    });

    it("should reject missing required fields", async () => {
      const gql = orpcGraphQL(router);

      const mutation = `
        mutation {
          createUser(name: "Jane Doe") {
            id
          }
        }
      `;

      const result = await graphql({
        schema: gql.schema,
        source: mutation,
      });

      expect(result.errors).toBeDefined();
    });

    it("should reject invalid email format", async () => {
      const gql = orpcGraphQL(router);

      const mutation = `
        mutation {
          createUser(name: "Jane Doe", email: "invalid-email") {
            id
          }
        }
      `;

      const result = await graphql({
        schema: gql.schema,
        source: mutation,
      });

      expect(result.errors).toBeDefined();
    });
  });

  describe("SDL Structure", () => {
    it("should include Query type", () => {
      const gql = orpcGraphQL(router);

      expect(gql.sdl).toMatch(/type Query\s*\{/);
    });

    it("should include Mutation type", () => {
      const gql = orpcGraphQL(router);

      expect(gql.sdl).toMatch(/type Mutation\s*\{/);
    });

    it("should include getUser field in Query", () => {
      const gql = orpcGraphQL(router);

      expect(gql.sdl).toContain("getUser");
    });

    it("should include createUser field in Mutation", () => {
      const gql = orpcGraphQL(router);

      expect(gql.sdl).toContain("createUser");
    });
  });
});

