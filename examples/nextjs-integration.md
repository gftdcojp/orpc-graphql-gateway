# Next.js統合例

oRPC GraphQL GatewayをNext.jsプロジェクトに統合する方法です。

## セットアップ

```bash
pnpm add @gftdcojp/orpc-graphql-gateway graphql graphql-yoga
```

## 1. oRPC routerの定義

`src/server/orpc.ts`:

```typescript
import { z } from "zod";
import { orpc } from "@orpc/server";

export const router = orpc.router({
  getUser: orpc.procedure
    .input(z.object({ id: z.string() }))
    .output(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
    )
    .meta({ kind: "query" })
    .handler(async ({ input }) => {
      // 実際の実装
      return {
        id: input.id,
        name: "John Doe",
        email: "john@example.com",
      };
    }),

  createUser: orpc.procedure
    .input(
      z.object({
        name: z.string(),
        email: z.string().email(),
      }),
    )
    .output(z.object({ id: z.string() }))
    .meta({ kind: "mutation" })
    .handler(async ({ input }) => {
      // 実際の実装
      return { id: "123" };
    }),
});
```

## 2. GraphQL Gatewayの生成

`src/server/graphql.ts`:

```typescript
import { router } from "./orpc";
import { orpcGraphQL } from "@gftdcojp/orpc-graphql-gateway";

export const gql = orpcGraphQL(router);

export const { schema, sdl, createHandler } = gql;
```

## 3. GraphQLエンドポイントの作成

`src/app/api/graphql/route.ts`:

```typescript
import { createHandler } from "@/server/graphql";

export { createHandler as GET, createHandler as POST };
```

これで `/api/graphql` エンドポイントが利用可能になります。

## SDLの確認

GraphQL SDLを確認したい場合：

```typescript
import { sdl } from "@/server/graphql";

console.log(sdl);
```

## Federation対応

Federationを有効にする場合：

```typescript
// src/server/graphql.ts
import { router } from "./orpc";
import { orpcGraphQL } from "@gftdcojp/orpc-graphql-gateway";

export const gql = orpcGraphQL(router, {
  federation: {
    enabled: true,
    keyBy: {
      User: "id",
    },
  },
});

export const { schema, sdl, subgraphSDL, createHandler } = gql;
```

`subgraphSDL`をApollo Gatewayに投入します。
