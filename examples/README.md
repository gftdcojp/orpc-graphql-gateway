# Examples

このディレクトリには、`@gftdcojp/orpc-graphql-gateway`の使用例が含まれています。

## ファイル構成

- `basic-usage.ts` - 基本的な使用方法
- `nested-router.ts` - ネストされたrouterの使用例
- `orpc-router.ts` - oRPC router定義の例
- `graphql-server.ts` - GraphQLサーバー実装例
- `nextjs-api-route.ts` - Next.js API Route統合例
- `example.test.ts` - 基本的な動作検証テスト
- `integration.test.ts` - 統合テスト

## 基本的な使用方法

### 1. oRPC routerの定義

```typescript
import { z } from "zod";
import type { OrpcRouter, OrpcProcedure } from "../src/internal/types.js";

export const router: OrpcRouter = {
  procedures: {
    getUser: {
      input: z.object({ id: z.string() }),
      output: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
      meta: { kind: "query" },
      handler: async ({ input }) => {
        return {
          id: input.id,
          name: "John Doe",
          email: "john@example.com",
        };
      },
    } as OrpcProcedure,
  },
};
```

### 2. GraphQL Gatewayの生成

```typescript
import { orpcGraphQL } from "../src/orpc-graphql.js";
import { router } from "./orpc-router.js";

const gql = orpcGraphQL(router);

export const { schema, sdl, createHandler } = gql;
```

### 3. GraphQLクエリの実行

```typescript
import { graphql } from "graphql";
import { gql } from "./graphql-server.js";

const query = `
  query {
    getUser(id: "123") {
      id
      name
      email
    }
  }
`;

const result = await graphql({
  schema: gql.schema,
  source: query,
});

console.log(result.data);
```

## Next.js統合

詳細は [`nextjs-integration.md`](./nextjs-integration.md) を参照してください。

## テストの実行

```bash
# すべてのexampleテストを実行
pnpm test examples/

# 特定のテストファイルを実行
pnpm test examples/example.test.ts
pnpm test examples/integration.test.ts
```

## 動作確認

すべてのexampleはテストで動作検証されています：

```bash
pnpm test examples/
```

