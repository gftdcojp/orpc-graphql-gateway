# @gftdcojp/orpc-graphql

oRPC routerからGraphQL schemaを自動生成するライブラリ。

## 概要

**「routerにだけ書けば、oRPC・OpenAPI・GraphQLの3つが同じ型情報から出る」**

oRPCのrouterを唯一の真実（single source of truth）として、GraphQL schemaを自動生成します。これにより、型安全性を保ちながら、GraphQLの汎用性も活用できます。

## 特徴

- 🎯 **一元管理**: oRPC routerにすべての手続きを集約
- 🔄 **自動変換**: ZodスキーマからGraphQL型への自動変換
- 🚀 **型安全**: TypeScriptの型システムを活用
- 🔌 **簡単統合**: Next.jsなどのフレームワークに簡単に統合可能

## インストール

```bash
pnpm add @gftdcojp/orpc-graphql graphql
```

## 基本的な使い方

### 1. oRPC routerの定義

```typescript
import { orpc } from "@orpc/runtime";
import { z } from "zod";

export const router = orpc.router({
  getUser: orpc.procedure
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .meta({ kind: "query" })
    .handler(async ({ input }) => {
      // 実装
    }),
});
```

### 2. GraphQL schemaの生成

```typescript
import { buildGraphQLSchemaFromOrpc } from "@gftdcojp/orpc-graphql";
import { router } from "./router";

const schema = buildGraphQLSchemaFromOrpc(router);
```

### 3. Next.js統合

```typescript
// src/app/api/graphql/route.ts
import { buildGraphQLSchemaFromOrpc } from "@gftdcojp/orpc-graphql";
import { router } from "@/server/orpc";
import { createYoga } from "graphql-yoga";

const schema = buildGraphQLSchemaFromOrpc(router);

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
});

export { yoga as GET, yoga as POST };
```

## Zod → GraphQL 変換ルール

| Zod               | GraphQL                    |
| ----------------- | -------------------------- |
| `z.string()`      | `GraphQLString`            |
| `z.number()`      | `GraphQLFloat` or `Int`    |
| `z.boolean()`     | `GraphQLBoolean`           |
| `z.array(x)`      | `GraphQLList`              |
| `z.object({...})` | `GraphQLInputObjectType`   |
| `z.enum([...])`   | `GraphQLEnumType`          |
| `z.nullable(x)`   | nullable                   |
| `z.union(...)`    | `GraphQLUnionType` (output) |

## 名前解決ポリシー

ネストされたrouterはフラットな名前に変換されます：

- `user.get` → `user_get`
- `post.create` → `post_create`

## API

### `buildGraphQLSchemaFromOrpc(router, options?)`

oRPC routerからGraphQL schemaを構築します。

**パラメータ:**

- `router`: oRPC routerオブジェクト
- `options`: オプション設定
  - `namingPolicy`: 名前解決ポリシー（`"flat"` | `"nested"`）
  - `isQueryFn`: クエリ判定のカスタム関数

**戻り値:** `GraphQLSchema`

## ライセンス

MIT

