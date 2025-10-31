/**
 * @fileoverview GraphQL HTTPハンドラ実装
 * 
 * Next.jsやExpressなどで使えるHTTPハンドラを提供します。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet}
 * 
 * @module internal/handler
 */

import { GraphQLSchema } from "graphql";

/**
 * HTTPハンドラのオプション
 */
export interface HandlerOptions {
  /** GraphQLエンドポイントのパス */
  endpoint?: string;
  /** カスタムコンテキスト作成関数 */
  context?: (request: Request) => unknown;
}

/**
 * GraphQL HTTPハンドラを作成
 * 
 * @param schema - GraphQL schema
 * @param options - ハンドラオプション
 * @returns HTTPハンドラ
 */
export function createGraphQLHandler(
  schema: GraphQLSchema,
  options: HandlerOptions = {},
): (request: Request) => Promise<Response> {
  return async (request: Request): Promise<Response> => {
    try {
      // graphql-yogaを動的にインポート
      // @ts-expect-error - graphql-yogaはoptional dependency
      const { createYoga } = await import("graphql-yoga");

      const yoga = createYoga({
        schema,
        graphqlEndpoint: options.endpoint || "/api/graphql",
        context: options.context ? options.context(request) : undefined,
      });

      return yoga.fetch(request);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.message.includes("Cannot find module") ||
          error.message.includes("Cannot resolve"))
      ) {
        throw new Error(
          "graphql-yoga is required. Please install it: pnpm add graphql-yoga",
        );
      }
      throw error;
    }
  };
}

