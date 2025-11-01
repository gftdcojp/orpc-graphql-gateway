/**
 * @fileoverview Apollo Server統合デモ
 * 
 * orpc-graphql-gatewayで生成したGraphQLスキーマをApollo Serverで使用する例です。
 * 
 * @module examples/apollo-demo/server
 */

import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { orpcGraphQL } from "../../src/orpc-graphql.js";
import { router } from "../orpc-router.js";

async function startServer() {
  // oRPC routerからGraphQL Gatewayを生成
  const gql = orpcGraphQL(router);

  // Apollo Serverを作成
  const server = new ApolloServer({
    schema: gql.schema,
    introspection: true, // 開発環境では有効化
  });

  // サーバーを起動
  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
  });

  console.log(`🚀 Apollo Server ready at: ${url}`);
  console.log(`📊 GraphQL Playground: ${url}`);
  console.log(`\n📝 GraphQL SDL:\n${gql.sdl}`);
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

