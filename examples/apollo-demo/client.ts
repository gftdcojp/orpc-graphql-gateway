/**
 * @fileoverview Apollo Client統合デモ
 * 
 * Apollo Clientを使ってGraphQLクエリを実行する例です。
 * 
 * @module examples/apollo-demo/client
 */

import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core";

// Apollo Clientを作成（Node.js環境用）
const client = new ApolloClient({
  uri: "http://localhost:4000",
  cache: new InMemoryCache(),
  // Node.js環境ではfetchを使用
  fetch: globalThis.fetch,
});

// GraphQLクエリ
const GET_USER_QUERY = gql`
  query GetUser($id: String!) {
    getUser(id: $id) {
      id
      name
      email
    }
  }
`;

// GraphQLミューテーション
const CREATE_USER_MUTATION = gql`
  mutation CreateUser($name: String!, $email: String!) {
    createUser(name: $name, email: $email) {
      id
    }
  }
`;

async function runDemo() {
  console.log("=== Apollo Client Demo ===\n");

  try {
    // 1. Queryの実行
    console.log("1. getUserクエリを実行中...");
    const queryResult = await client.query({
      query: GET_USER_QUERY,
      variables: { id: "123" },
    });

    console.log("✓ クエリが成功しました:");
    console.log(JSON.stringify(queryResult.data, null, 2));
    console.log();

    // 2. Mutationの実行
    console.log("2. createUserミューテーションを実行中...");
    const mutationResult = await client.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    });

    console.log("✓ ミューテーションが成功しました:");
    console.log(JSON.stringify(mutationResult.data, null, 2));
    console.log();

    // 3. エラーハンドリング
    console.log("3. エラーハンドリングのテスト...");
    try {
      await client.query({
        query: GET_USER_QUERY,
        variables: { id: 123 as any }, // 型エラーを意図的に発生
      });
    } catch (error) {
      console.log("✓ 期待通りエラーが発生しました:");
      console.log((error as Error).message);
    }
  } catch (error) {
    console.error("エラーが発生しました:", error);
    process.exit(1);
  }
}

runDemo();

