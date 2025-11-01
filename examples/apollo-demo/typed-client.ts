/**
 * @fileoverview 型安全なApollo Clientデモ
 * 
 * GraphQL Code Generatorで生成した型を使って型安全なクエリを実行する例です。
 * 
 * @module examples/apollo-demo/typed-client
 */

import { ApolloClient, InMemoryCache } from "@apollo/client/core";
import { GetUserDocument, CreateUserDocument } from "./generated/graphql";

// Apollo Clientを作成（Node.js環境用）
const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  // Node.js環境ではfetchを使用
  fetch: globalThis.fetch,
});

async function runTypedDemo() {
  console.log("=== Typed Apollo Client Demo ===\n");

  try {
    // 1. 型安全なQueryの実行
    console.log("1. getUserクエリを実行中（型安全）...");
    const queryResult = await client.query({
      query: GetUserDocument,
      variables: {
        id: "123", // 型チェックされる
      },
    });

    // 型が推論される
    const user = queryResult.data.getUser;
    console.log("✓ クエリが成功しました:");
    console.log(`  ID: ${user.id}`);
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log();

    // 2. 型安全なMutationの実行
    console.log("2. createUserミューテーションを実行中（型安全）...");
    const mutationResult = await client.mutate({
      mutation: CreateUserDocument,
      variables: {
        name: "Jane Doe",
        email: "jane@example.com", // 型チェックされる
      },
    });

    const createdUser = mutationResult.data?.createUser;
    console.log("✓ ミューテーションが成功しました:");
    console.log(`  Created User ID: ${createdUser?.id}`);
    console.log();
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

runTypedDemo();

