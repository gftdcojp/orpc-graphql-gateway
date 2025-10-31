/**
 * @fileoverview GraphQL resolver委譲実装
 * 
 * GraphQL resolverからoRPC procedureを呼び出すためのユーティリティ。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet process:resolver-delegate}
 * 
 * @module internal/resolver-delegate
 */

import { z } from "zod";
import { GraphQLResolveInfo } from "graphql";
import { OrpcProcedure, OrpcRouter } from "./types.js";

/**
 * GraphQL resolverのコンテキスト
 */
export interface GraphQLContext {
  /** oRPC routerへの参照 */
  router?: OrpcRouter;
  /** その他のコンテキスト情報 */
  [key: string]: unknown;
}

/**
 * oRPC procedureを呼び出すresolverを生成
 * 
 * @param procedure - oRPC procedure
 * @param procedureName - 手続き名（デバッグ用）
 * @returns GraphQL resolver関数
 */
export function createOrpcResolver(
  procedure: OrpcProcedure,
  procedureName: string,
) {
  return async (
    _root: unknown,
    args: unknown,
    ctx: GraphQLContext,
    _info: GraphQLResolveInfo,
  ) => {
    try {
      // 入力検証
      const input = procedure.input.parse(args);

      // oRPC procedureを呼び出し
      const result = await procedure.handler({
        input,
        ctx: ctx as unknown,
      });

      // 出力検証
      const output = procedure.output.parse(result);

      return output;
    } catch (error) {
      // Zodの検証エラーを適切に処理
      if (error instanceof z.ZodError) {
        throw new Error(
          `Validation error in ${procedureName}: ${error.message}`,
        );
      }
      throw error;
    }
  };
}

/**
 * routerから手続きを取得（ネストされた名前に対応）
 * 
 * @param router - oRPC router
 * @param procedureName - 手続き名（例: "user_get"）
 * @returns procedureまたはundefined
 */
export function getProcedureFromRouter(
  router: OrpcRouter,
  procedureName: string,
): OrpcProcedure | undefined {
  const parts = procedureName.split("_");
  let current: OrpcRouter | OrpcProcedure | undefined = router;

  for (const part of parts) {
    if (!current || typeof current !== "object") {
      return undefined;
    }

    if ("procedures" in current) {
      // routerの場合
      const procedures: Record<string, OrpcRouter | OrpcProcedure> | undefined =
        (current as OrpcRouter).procedures;
      if (!procedures) {
        return undefined;
      }
      current = procedures[part];
    } else {
      // procedureの場合はここに来ないはず
      return undefined;
    }
  }

  // 最後の部分がprocedureかチェック
  if (
    current &&
    typeof current === "object" &&
    "input" in current &&
    "output" in current &&
    "handler" in current
  ) {
    return current as OrpcProcedure;
  }

  return undefined;
}

