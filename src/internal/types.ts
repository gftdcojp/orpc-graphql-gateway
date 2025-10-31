/**
 * @fileoverview oRPC router型定義
 * 
 * oRPCのrouter構造を型で定義します。
 * 実際のoRPCライブラリの型と互換性を持つように設計します。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet process:router-analyzer}
 * 
 * @module internal/types
 */

import { z } from "zod";
import { GraphQLFieldConfig } from "graphql";

/**
 * oRPC procedureのメタ情報
 */
export interface OrpcProcedureMeta {
  /** HTTPメソッド（GET/POSTなど） */
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  /** 手続きの種類（query/mutation/subscription） */
  kind?: "query" | "mutation" | "subscription";
  /** 認証要件 */
  auth?: string | string[];
  /** その他のメタ情報 */
  [key: string]: unknown;
}

/**
 * oRPC procedureの定義
 */
export interface OrpcProcedure<
  TInput extends z.ZodTypeAny = z.ZodTypeAny,
  TOutput extends z.ZodTypeAny = z.ZodTypeAny,
> {
  /** 入力スキーマ（Zod） */
  input: TInput;
  /** 出力スキーマ（Zod） */
  output: TOutput;
  /** メタ情報 */
  meta?: OrpcProcedureMeta;
  /** ハンドラー関数 */
  handler: (args: {
    input: z.infer<TInput>;
    ctx?: unknown;
  }) => Promise<z.infer<TOutput>> | z.infer<TOutput>;
}

/**
 * oRPC routerの定義
 * 
 * routerは手続き（procedure）の集合であり、
 * ネストしたrouterも含むことができます。
 */
export interface OrpcRouter {
  /** 手続きの定義 */
  procedures?: Record<string, OrpcProcedure | OrpcRouter>;
  /** routerのメタ情報 */
  meta?: Record<string, unknown>;
}

/**
 * 手続きの解析結果
 */
export interface AnalyzedProcedure {
  /** 手続き名（フラット化済み） */
  name: string;
  /** 手続き定義 */
  procedure: OrpcProcedure;
  /** クエリかミューテーションか */
  isQuery: boolean;
  /** GraphQLフィールド設定 */
  fieldConfig: GraphQLFieldConfig<any, any>;
}

/**
 * router解析のオプション
 */
export interface RouterAnalysisOptions {
  /** 名前解決ポリシー */
  namingPolicy?: "flat" | "nested";
  /** クエリ判定のカスタム関数 */
  isQueryFn?: (procedure: OrpcProcedure) => boolean;
}

