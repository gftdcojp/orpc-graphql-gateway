/**
 * @fileoverview oRPC GraphQL Gateway - メインエクスポート
 * 
 * oRPC routerからGraphQL schemaを自動生成するライブラリのエントリーポイント。
 * orpcOpenapiと同じ感覚でGraphQLを公開できます。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet}
 * 
 * @module index
 */

// メインAPI（orpcOpenapiと同じ感覚）
export { orpcGraphQL } from "./orpc-graphql.js";
export type {
  OrpcGraphQLOptions,
  OrpcGraphQLResult,
  FederationOptions,
  RequestHandler,
} from "./orpc-graphql.js";

// 下位レベルAPI（必要に応じて）
export { buildGraphQLSchemaFromOrpc } from "./internal/schema-builder.js";
export type {
  OrpcRouter,
  OrpcProcedure,
  OrpcProcedureMeta,
  RouterAnalysisOptions,
} from "./internal/types.js";
export type { GraphQLContext } from "./internal/resolver-delegate.js";
export {
  zodToGraphQLInputType,
  zodToGraphQLOutputType,
  zodToGraphQLArgs,
} from "./internal/zod-to-graphql.js";

