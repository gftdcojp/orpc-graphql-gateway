/**
 * @fileoverview Zod → GraphQL変換のテスト
 * 
 * @module internal/zod-to-graphql.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  zodToGraphQLInputType,
  zodToGraphQLOutputType,
  zodToGraphQLArgs,
} from "./zod-to-graphql.js";
import {
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLNonNull,
  GraphQLList,
} from "graphql";

describe("zodToGraphQLInputType", () => {
  it("should convert z.string() to GraphQLString", () => {
    const schema = z.string();
    const gqlType = zodToGraphQLInputType(schema);
    // デフォルトはnon-nullableなのでGraphQLNonNullでラップされる
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType).toBe(GraphQLString);
  });

  it("should convert z.number() to GraphQLFloat", () => {
    const schema = z.number();
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType).toBe(GraphQLFloat);
  });

  it("should convert z.boolean() to GraphQLBoolean", () => {
    const schema = z.boolean();
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType).toBe(GraphQLBoolean);
  });

  it("should convert z.array() to GraphQLList", () => {
    const schema = z.array(z.string());
    const gqlType = zodToGraphQLInputType(schema);
    // GraphQLNonNullでラップされる
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType).toBeInstanceOf(GraphQLList);
  });

  it("should convert z.object() to GraphQLInputObjectType", () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });
    const gqlType = zodToGraphQLInputType(schema, "UserInput");
    // GraphQLNonNullでラップされる
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType.constructor.name).toBe("GraphQLInputObjectType");
  });

  it("should handle nullable types", () => {
    const schema = z.string().nullable();
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBe(GraphQLString);
  });

  it("should handle optional types", () => {
    const schema = z.string().optional();
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBe(GraphQLString);
  });
});

describe("zodToGraphQLOutputType", () => {
  it("should convert z.string() to GraphQLString", () => {
    const schema = z.string();
    const gqlType = zodToGraphQLOutputType(schema);
    // デフォルトはnon-nullableなのでGraphQLNonNullでラップされる
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType).toBe(GraphQLString);
  });

  it("should convert z.object() to GraphQLObjectType", () => {
    const schema = z.object({
      id: z.string(),
      name: z.string(),
    });
    const gqlType = zodToGraphQLOutputType(schema, "User");
    // GraphQLNonNullでラップされる
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType.constructor.name).toBe("GraphQLObjectType");
  });
});

describe("zodToGraphQLArgs", () => {
  it("should convert z.object() to GraphQLFieldConfigArgumentMap", () => {
    const schema = z.object({
      id: z.string(),
      age: z.number().optional(),
    });
    const args = zodToGraphQLArgs(schema);
    expect(args).toHaveProperty("id");
    expect(args).toHaveProperty("age");
    expect(args.id.type).toBeInstanceOf(GraphQLNonNull);
    // optionalな場合はnullableなのでGraphQLNonNullでラップされない
    expect(args.age.type).toBe(GraphQLFloat);
  });
});

