# Next.js統合例

oRPC GraphQL EmitterをNext.jsプロジェクトに統合する方法です。

## セットアップ

```bash
pnpm add @gftdcojp/orpc-graphql graphql-yoga
```

## GraphQLエンドポイントの作成

`src/app/api/graphql/route.ts`:

```typescript
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

## oRPC routerの例

`src/server/orpc.ts`:

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

これで `/api/graphql` エンドポイントが利用可能になります。

