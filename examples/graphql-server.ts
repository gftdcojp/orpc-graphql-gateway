/**
 * @fileoverview GraphQLサーバー実装例
 * 
 * このファイルは `src/server/graphql.ts` に配置します。
 * 
 * @module examples/graphql-server
 */

import { orpcGraphQL } from "../src/orpc-graphql.js";
import { router } from "./orpc-router.js";

// GraphQL Gatewayの生成
export const gql = orpcGraphQL(router);

// 必要なエクスポート
export const { schema, sdl, createHandler } = gql;

