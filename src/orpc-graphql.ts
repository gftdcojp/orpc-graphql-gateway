/**
 * @fileoverview oRPC GraphQL Gateway - メインAPI
 * 
 * orpcOpenapiと同じ感覚でGraphQLを公開するためのAPI。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet}
 * 
 * @module orpc-graphql
 */

import { printSchema, GraphQLSchema } from "graphql";
import { OrpcRouter, RouterAnalysisOptions } from "./internal/types.js";
import { buildGraphQLSchemaFromOrpc } from "./internal/schema-builder.js";
import { createGraphQLHandler } from "./internal/handler.js";

/**
 * Federation設定
 */
export interface FederationOptions {
  /** Federationを有効にする */
  enabled: boolean;
  /** エンティティのキー設定（エンティティ名 -> キーフィールド名） */
  keyBy?: Record<string, string>;
}

/**
 * oRPC GraphQL設定オプション
 */
export interface OrpcGraphQLOptions extends RouterAnalysisOptions {
  /** Federation設定 */
  federation?: FederationOptions;
}

/**
 * oRPC GraphQL Gatewayの戻り値
 */
export interface OrpcGraphQLResult {
  /** GraphQL schemaオブジェクト */
  schema: GraphQLSchema;
  /** GraphQL SDL（文字列） */
  sdl: string;
  /** FederatedなSDL（federation有効時のみ） */
  subgraphSDL?: string;
  /** HTTPハンドラを作成する関数 */
  createHandler: () => RequestHandler;
}

/**
 * HTTPリクエストハンドラの型
 */
export type RequestHandler = (
  request: Request,
) => Promise<Response> | Response;

/**
 * oRPC routerからGraphQL Gatewayを生成
 * 
 * @param router - oRPC router
 * @param options - オプション設定
 * @returns GraphQL Gatewayオブジェクト
 * 
 * @example
 * ```ts
 * import { orpcGraphQL } from '@gftdcojp/orpc-graphql';
 * import { router } from './router';
 * 
 * const gql = orpcGraphQL(router);
 * export const { schema, sdl, createHandler } = gql;
 * ```
 */
export function orpcGraphQL(
  router: OrpcRouter,
  options: OrpcGraphQLOptions = {},
): OrpcGraphQLResult {
  // GraphQL schemaを生成
  const schema = buildGraphQLSchemaFromOrpc(router, options);

  // SDLを生成
  const sdl = printSchema(schema);

  // Federation対応（将来実装）
  let subgraphSDL: string | undefined;
  if (options.federation?.enabled) {
    // TODO: @apollo/subgraph を使ってsubgraphSDLを生成
    subgraphSDL = sdl; // 暫定実装
  }

  // HTTPハンドラを作成する関数
  const createHandler = (): RequestHandler => {
    return createGraphQLHandler(schema);
  };

  return {
    schema,
    sdl,
    subgraphSDL,
    createHandler,
  };
}


