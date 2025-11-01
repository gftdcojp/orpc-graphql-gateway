# Apollo Server & Apollo Client デモ

oRPC GraphQL Gatewayで生成したGraphQLスキーマをApollo ServerとApollo Clientで使用するデモです。

## セットアップ

```bash
cd examples/apollo-demo
pnpm install
```

## 実行方法

### 1. Apollo Serverを起動

```bash
# プロジェクトルートから
pnpm build  # ライブラリをビルド
cd examples/apollo-demo
pnpm server
```

サーバーは `http://localhost:4000` で起動します。

### 2. Apollo Clientでクエリを実行

別のターミナルで：

```bash
cd examples/apollo-demo
pnpm client
```

### 3. 型安全なクライアントの実行

```bash
pnpm typed-client
```

## GraphQL Code Generatorの使用

型安全なGraphQLクエリを作成するために、GraphQL Code Generatorを使用します。

### 設定

`codegen.ts` ファイルで設定を確認してください。

### 型生成

```bash
# サーバーが起動している状態で実行
pnpm codegen

# ウォッチモード
pnpm codegen:watch
```

生成された型は `generated/graphql.ts` に出力されます。

## ファイル構成

- `server.ts` - Apollo Serverの実装
- `client.ts` - Apollo Clientの基本的な使用例
- `typed-client.ts` - 型安全なApollo Clientの使用例
- `codegen.ts` - GraphQL Code Generatorの設定
- `generated/` - 生成された型定義（デモ用）

## GraphQL Playground

サーバー起動後、以下のURLでGraphQL Playgroundにアクセスできます：

http://localhost:4000

## 使用例

### Apollo Server

```typescript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { orpcGraphQL } from "@gftdcojp/orpc-graphql-gateway";
import { router } from "./router";

const gql = orpcGraphQL(router);

const server = new ApolloServer({
  schema: gql.schema,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});
```

### Apollo Client

```typescript
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  fetch: globalThis.fetch, // Node.js環境用
});

const GET_USER = gql`
  query GetUser($id: String!) {
    getUser(id: $id) {
      id
      name
      email
    }
  }
`;

const result = await client.query({
  query: GET_USER,
  variables: { id: "123" },
});
```

### 型安全なクライアント

```typescript
import { ApolloClient } from "@apollo/client/core";
import { GetUserDocument } from "./generated/graphql";

const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  fetch: globalThis.fetch,
});

// 型が推論される
const result = await client.query({
  query: GetUserDocument,
  variables: {
    id: "123", // 型チェックされる
  },
});

// result.data.getUser の型が推論される
```

## トラブルシューティング

詳細は [`SETUP.md`](./SETUP.md) を参照してください。
