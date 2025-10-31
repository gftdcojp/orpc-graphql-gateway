/**
 * @fileoverview Example実行スクリプト
 * 
 * このスクリプトはexampleの動作を確認するために使用します。
 * 
 * @module examples/run-example
 */

import { orpcGraphQL } from "../src/orpc-graphql.js";
import { router } from "./orpc-router.js";
import { graphql } from "graphql";

async function main() {
  console.log("=== oRPC GraphQL Gateway Example ===\n");

  // 1. GraphQL Gatewayの生成
  console.log("1. GraphQL Gatewayを生成中...");
  const gql = orpcGraphQL(router);
  console.log("✓ GraphQL Gatewayが生成されました\n");

  // 2. SDLの表示
  console.log("2. GraphQL SDL:");
  console.log("─".repeat(50));
  console.log(gql.sdl);
  console.log("─".repeat(50));
  console.log();

  // 3. Queryの実行
  console.log("3. getUserクエリを実行中...");
  const query = `
    query {
      getUser(id: "123") {
        id
        name
        email
      }
    }
  `;

  const queryResult = await graphql({
    schema: gql.schema,
    source: query,
  });

  if (queryResult.errors) {
    console.error("✗ エラーが発生しました:", queryResult.errors);
  } else {
    console.log("✓ クエリが成功しました:");
    console.log(JSON.stringify(queryResult.data, null, 2));
  }
  console.log();

  // 4. Mutationの実行
  console.log("4. createUserミューテーションを実行中...");
  const mutation = `
    mutation {
      createUser(name: "Jane Doe", email: "jane@example.com") {
        id
      }
    }
  `;

  const mutationResult = await graphql({
    schema: gql.schema,
    source: mutation,
  });

  if (mutationResult.errors) {
    console.error("✗ エラーが発生しました:", mutationResult.errors);
  } else {
    console.log("✓ ミューテーションが成功しました:");
    console.log(JSON.stringify(mutationResult.data, null, 2));
  }
  console.log();

  // 5. バリデーションエラーの確認
  console.log("5. バリデーションエラーの確認...");
  const invalidQuery = `
    query {
      getUser(id: 123) {
        id
        name
        email
      }
    }
  `;

  const invalidResult = await graphql({
    schema: gql.schema,
    source: invalidQuery,
  });

  if (invalidResult.errors) {
    console.log("✓ 期待通りバリデーションエラーが発生しました:");
    console.log(invalidResult.errors[0]?.message);
  } else {
    console.log("✗ エラーが発生しませんでした（予期しない動作）");
  }
  console.log();

  console.log("=== Example完了 ===");
}

main().catch((error) => {
  console.error("エラーが発生しました:", error);
  process.exit(1);
});

