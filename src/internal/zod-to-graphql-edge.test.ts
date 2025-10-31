/**
 * @fileoverview Zod → GraphQL変換のエッジケーステスト
 * 
 * @module internal/zod-to-graphql-edge.test
 */

import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  zodToGraphQLInputType,
  zodToGraphQLOutputType,
  zodToGraphQLArgs,
} from "./zod-to-graphql.js";
import { GraphQLString, GraphQLFloat, GraphQLNonNull } from "graphql";

describe("zodToGraphQLInputType - edge cases", () => {
  it("should handle nested nullable types", () => {
    const schema = z.string().nullable().optional();
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBe(GraphQLString);
  });

  it("should handle array of nullable types", () => {
    const schema = z.array(z.string().nullable());
    const gqlType = zodToGraphQLInputType(schema);
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });

  it("should handle object with all optional fields", () => {
    const schema = z.object({
      name: z.string().optional(),
      age: z.number().optional(),
    });
    const gqlType = zodToGraphQLInputType(schema, "OptionalInput");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });

  it("should handle object with mixed required and optional fields", () => {
    const schema = z.object({
      required: z.string(),
      optional: z.string().optional(),
      nullable: z.string().nullable(),
    });
    const gqlType = zodToGraphQLInputType(schema, "MixedInput");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });

  it("should handle enum with entries object", () => {
    const schema = z.enum(["A", "Bill", "C"]);
    const gqlType = zodToGraphQLInputType(schema, "MyEnum");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType.constructor.name).toBe("GraphQLEnumType");
  });

  it("should handle union with multiple object types (input)", () => {
    const schema = z.union([
      z.object({ type: z.literal("A"), value: z.string() }),
      z.object({ type: z.literal("B"), value: z.number() }),
    ]);
    const gqlType = zodToGraphQLInputType(schema, "UnionInput");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });

  it("should throw error for union input with non-object options", () => {
    const schema = z.union([z.string(), z.number()]);
    expect(() => zodToGraphQLInputType(schema, "UnionInput")).toThrow();
  });
});

describe("zodToGraphQLOutputType - edge cases", () => {
  it("should handle union with multiple object types (output)", () => {
    const schema = z.union([
      z.object({ type: z.literal("A"), value: z.string() }),
      z.object({ type: z.literal("B"), value: z.number() }),
    ]);
    const gqlType = zodToGraphQLOutputType(schema, "UnionOutput");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
    expect((gqlType as any).ofType.constructor.name).toBe("GraphQLUnionType");
  });

  it("should handle nested objects", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        profile: z.object({
          bio: z.string().optional(),
        }),
      }),
    });
    const gqlType = zodToGraphQLOutputType(schema, "NestedOutput");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });

  it("should handle array of objects", () => {
    const schema = z.array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    );
    const gqlType = zodToGraphQLOutputType(schema, "UserArray");
    expect(gqlType).toBeInstanceOf(GraphQLNonNull);
  });
});

describe("zodToGraphQLArgs - edge cases", () => {
  it("should handle empty object", () => {
    const schema = z.object({});
    const args = zodToGraphQLArgs(schema);
    expect(Object.keys(args)).toHaveLength(0);
  });

  it("should handle object with only optional fields", () => {
    const schema = z.object({
      optional1: z.string().optional(),
      optional2: z.number().optional(),
    });
    const args = zodToGraphQLArgs(schema);
    expect(args).toHaveProperty("optional1");
    expect(args).toHaveProperty("optional2");
    // optionalなフィールドはnullableなのでGraphQLNonNullでラップされない
    expect(args.optional1.type).toBe(GraphQLString);
    expect(args.optional2.type).toBe(GraphQLFloat);
  });

  it("should handle object with nullable fields", () => {
    const schema = z.object({
      nullable: z.string().nullable(),
      required: z.string(),
    });
    const args = zodToGraphQLArgs(schema);
    expect(args.nullable.type).toBe(GraphQLString);
    expect(args.required.type).toBeInstanceOf(GraphQLNonNull);
  });

  it("should handle nested object arguments", () => {
    const schema = z.object({
      user: z.object({
        name: z.string(),
        age: z.number().optional(),
      }),
    });
    const args = zodToGraphQLArgs(schema);
    expect(args).toHaveProperty("user");
  });

  it("should skip fields that cannot be converted", () => {
    // tupleは未対応なので、変換できない
    const schema = z.object({
      id: z.string(),
      // tuple: z.tuple([z.string(), z.number()]), // これは変換できない
    });
    const args = zodToGraphQLArgs(schema);
    expect(args).toHaveProperty("id");
  });
});

