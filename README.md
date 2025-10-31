# @gftdcojp/orpc-graphql-gateway

oRPC routerからGraphQL schemaを自動生成するライブラリ。**orpcOpenapiと同じ感覚**でGraphQLを公開できます。

## 概要

**「routerにだけ書けば、oRPC・OpenAPI・GraphQLの3つが同じ型情報から出る」**

oRPCのrouterを唯一の真実（single source of truth）として、GraphQL schemaを自動生成します。これにより、型安全性を保ちながら、GraphQLの汎用性も活用できます。

## 特徴

- 🎯 **一元管理**: oRPC routerにすべての手続きを集約
- 🔄 **自動変換**: ZodスキーマからGraphQL型への自動変換
- 🚀 **型安全**: TypeScriptの型システムを活用
- 🔌 **簡単統合**: Next.jsなどのフレームワークに簡単に統合可能
- 📦 **orpcOpenapiと同じ感覚**: 同じメンタルモデルでGraphQLを公開

## インストール

```bash
pnpm add @gftdcojp/orpc-graphql-gateway graphql graphql-yoga
```

## 基本的な使い方

### 1. oRPC routerの定義

```typescript
// src/server/orpc.ts
import { z } from "zod";
import { orpc } from "@orpc/server";

export const router = orpc.router({
  user: orpc.procedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ input }) => {
      return { id: input.id, name: "Jun" };
    }),
});
```

### 2. GraphQL Gatewayの生成

```typescript
// src/server/graphql.ts
import { router } from "./orpc";
import { orpcGraphQL } from "@gftdcojp/orpc-graphql-gateway";

export const gql = orpcGraphQL(router);

export const { schema, sdl, createHandler } = gql;
```

### 3. Next.js統合

```typescript
// src/app/api/graphql/route.ts
import { createHandler } from "@/server/graphql";

export { createHandler as GET, createHandler as POST };
```

これで `/api/graphql` が立ちます。

## API

### `orpcGraphQL(router, options?)`

oRPC routerからGraphQL Gatewayを生成します。

**パラメータ:**

- `router`: oRPC routerオブジェクト
- `options`: オプション設定
  - `namingPolicy`: 名前解決ポリシー（`"flat"` | `"nested"`）
  - `isQueryFn`: クエリ判定のカスタム関数
  - `federation`: Federation設定
    - `enabled`: Federationを有効にする
    - `keyBy`: エンティティのキー設定

**戻り値:** `OrpcGraphQLResult`

```typescript
interface OrpcGraphQLResult {
  /** GraphQL schemaオブジェクト */
  schema: GraphQLSchema;
  /** GraphQL SDL（文字列） */
  sdl: string;
  /** FederatedなSDL（federation有効時のみ） */
  subgraphSDL?: string;
  /** HTTPハンドラを作成する関数 */
  createHandler: () => RequestHandler;
}
```

## Federation対応

Federationを有効にする場合は、オプションで設定できます：

```typescript
const gql = orpcGraphQL(router, {
  federation: {
    enabled: true,
    keyBy: {
      User: "id",
    },
  },
});

// Apollo Gatewayに投げる
export const subgraphSDL = gql.subgraphSDL;
```

## Zod → GraphQL 変換ルール

| Zod               | GraphQL                    |
| ----------------- | -------------------------- |
| `z.string()`      | `GraphQLString`            |
| `z.number()`      | `GraphQLFloat` or `Int`    |
| `z.boolean()`      | `GraphQLBoolean`           |
| `z.array(x)`      | `GraphQLList`              |
| `z.object({...})` | `GraphQLInputObjectType`   |
| `z.enum([...])`   | `GraphQLEnumType`          |
| `z.nullable(x)`   | nullable                   |
| `z.union(...)`    | `GraphQLUnionType` (output) |

## 名前解決ポリシー

ネストされたrouterはフラットな名前に変換されます：

- `user.get` → `user_get`
- `post.create` → `post_create`

## 下位レベルAPI

必要に応じて、より低レベルのAPIも利用できます：

```typescript
import { buildGraphQLSchemaFromOrpc } from "@gftdcojp/orpc-graphql-gateway";

const schema = buildGraphQLSchemaFromOrpc(router);
```

## ライセンス

MIT
