/**
 * @fileoverview oRPC router解析ユーティリティ
 * 
 * oRPC routerを走査し、手続きを抽出してGraphQL schema生成に必要な情報を準備します。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet process:router-analyzer}
 * 
 * @module internal/router-analyzer
 */

import {
  OrpcRouter,
  OrpcProcedure,
  AnalyzedProcedure,
  RouterAnalysisOptions,
} from "./types.js";
import {
  zodToGraphQLArgs,
  zodToGraphQLOutputType,
} from "./zod-to-graphql.js";
import { createOrpcResolver } from "./resolver-delegate.js";

/**
 * procedureがクエリかどうかを判定
 * 
 * @param procedure - oRPC procedure
 * @returns クエリの場合true
 */
function isQueryProcedure(procedure: OrpcProcedure): boolean {
  // メタ情報から判定
  if (procedure.meta?.kind === "query") {
    return true;
  }
  if (procedure.meta?.kind === "mutation") {
    return false;
  }
  // HTTPメソッドから判定
  if (procedure.meta?.method === "GET") {
    return true;
  }
  // デフォルトはmutationとして扱う（安全側）
  return false;
}

/**
 * routerから手続きを再帰的に抽出
 * 
 * @param router - oRPC router
 * @param prefix - 名前のプレフィックス（ネスト時に使用）
 * @param options - 解析オプション
 * @returns 抽出された手続きの配列
 */
function extractProcedures(
  router: OrpcRouter,
  prefix = "",
  options: RouterAnalysisOptions = {},
): AnalyzedProcedure[] {
  const procedures: AnalyzedProcedure[] = [];
  const proceduresRecord = router.procedures || {};

  for (const [name, value] of Object.entries(proceduresRecord)) {
    const fullName = prefix ? `${prefix}_${name}` : name;

    // ネストしたrouterの場合
    if (isRouter(value)) {
      const nestedProcedures = extractProcedures(
        value,
        fullName,
        options,
      );
      procedures.push(...nestedProcedures);
      continue;
    }

    // procedureの場合
    if (isProcedure(value)) {
      const isQuery =
        options.isQueryFn?.(value) ?? isQueryProcedure(value);

      procedures.push({
        name: fullName,
        procedure: value,
        isQuery,
        fieldConfig: {} as any, // 後で設定
      });
    }
  }

  return procedures;
}

/**
 * 値がrouterかどうかを判定
 * 
 * @param value - 判定する値
 * @returns routerの場合true
 */
function isRouter(value: unknown): value is OrpcRouter {
  return (
    typeof value === "object" &&
    value !== null &&
    "procedures" in value &&
    !("input" in value) &&
    !("output" in value) &&
    !("handler" in value)
  );
}

/**
 * 値がprocedureかどうかを判定
 * 
 * @param value - 判定する値
 * @returns procedureの場合true
 */
function isProcedure(value: unknown): value is OrpcProcedure {
  return (
    typeof value === "object" &&
    value !== null &&
    "input" in value &&
    "output" in value &&
    "handler" in value &&
    typeof (value as any).handler === "function"
  );
}

/**
 * routerを解析して手続きを抽出
 * 
 * @param router - oRPC router
 * @param options - 解析オプション
 * @returns 解析された手続きの配列
 */
export function analyzeRouter(
  router: OrpcRouter,
  options: RouterAnalysisOptions = {},
): AnalyzedProcedure[] {
  return extractProcedures(router, "", options);
}

/**
 * procedureからGraphQLフィールド設定を生成
 * 
 * @param analyzedProcedure - 解析された手続き
 * @returns GraphQLフィールド設定
 */
export function createGraphQLFieldConfig(
  analyzedProcedure: AnalyzedProcedure,
): AnalyzedProcedure {
  const { procedure, name } = analyzedProcedure;

  // 入力スキーマをGraphQL引数に変換
  const args = zodToGraphQLArgs(procedure.input);

  // 出力スキーマをGraphQL型に変換
  const outputType = zodToGraphQLOutputType(
    procedure.output,
    `${name}_Output`,
  );

  // resolverを生成（oRPC呼び出しに委譲）
  const resolve = createOrpcResolver(procedure, name);

  return {
    ...analyzedProcedure,
    fieldConfig: {
      type: outputType,
      args,
      resolve,
    },
  };
}

