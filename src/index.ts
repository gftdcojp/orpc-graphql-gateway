/**
 * @fileoverview oRPC GraphQL Emitter - メインエクスポート
 * 
 * oRPC routerからGraphQL schemaを自動生成するライブラリのエントリーポイント。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet}
 * 
 * @module index
 */

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

