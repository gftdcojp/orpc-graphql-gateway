/**
 * @fileoverview GraphQL schema生成ユーティリティ
 * 
 * 解析されたoRPC routerからGraphQL schemaを構築します。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet process:schema-builder}
 * 
 * @module internal/schema-builder
 */

import {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLFieldConfigMap,
} from "graphql";
import { OrpcRouter, RouterAnalysisOptions } from "./types.js";
import { analyzeRouter, createGraphQLFieldConfig } from "./router-analyzer.js";

/**
 * oRPC routerからGraphQL schemaを構築
 * 
 * @param router - oRPC router
 * @param options - 解析オプション
 * @returns GraphQL schema
 */
export function buildGraphQLSchemaFromOrpc(
  router: OrpcRouter,
  options: RouterAnalysisOptions = {},
): GraphQLSchema {
  // routerを解析して手続きを抽出
  const analyzedProcedures = analyzeRouter(router, options);

  // クエリとミューテーションに分類
  const queryFields: GraphQLFieldConfigMap<any, any> = {};
  const mutationFields: GraphQLFieldConfigMap<any, any> = {};

  for (const analyzedProcedure of analyzedProcedures) {
    const fieldConfig = createGraphQLFieldConfig(analyzedProcedure);

    if (fieldConfig.isQuery) {
      queryFields[fieldConfig.name] = fieldConfig.fieldConfig;
    } else {
      mutationFields[fieldConfig.name] = fieldConfig.fieldConfig;
    }
  }

  // GraphQL schemaを構築
  const queryType = new GraphQLObjectType({
    name: "Query",
    fields: queryFields,
  });

  const mutationType =
    Object.keys(mutationFields).length > 0
      ? new GraphQLObjectType({
          name: "Mutation",
          fields: mutationFields,
        })
      : undefined;

  return new GraphQLSchema({
    query: queryType,
    mutation: mutationType,
  });
}

