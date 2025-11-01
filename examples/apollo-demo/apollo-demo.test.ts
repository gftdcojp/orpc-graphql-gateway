/**
 * @fileoverview Apolloデモの動作検証テスト
 * 
 * @module examples/apollo-demo/apollo-demo.test
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core";
import { orpcGraphQL } from "../../src/orpc-graphql.js";
import { router } from "../orpc-router.js";

describe("Apollo Server & Client Demo", () => {
  let server: ApolloServer | null = null;
  let serverUrl: string = "";
  let client: ApolloClient<any> | null = null;

  beforeAll(async () => {
    try {
      // GraphQL Gatewayを生成
      const gql = orpcGraphQL(router);

      // Apollo Serverを作成
      server = new ApolloServer({
        schema: gql.schema,
      });

      // サーバーを起動
      const { url } = await startStandaloneServer(server, {
        listen: { port: 0 }, // ランダムポートを使用
      });

      serverUrl = url;

      // Apollo Clientを作成（Node.js環境用）
      client = new ApolloClient({
        uri: serverUrl,
        cache: new InMemoryCache(),
        // Node.js環境ではfetchを使用
        fetch: globalThis.fetch,
      });
    } catch (error) {
      console.error("Failed to start server:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (server) {
      await server.stop();
    }
  });

  it("should execute GraphQL query via Apollo Client", async () => {
    if (!client) {
      throw new Error("Client not initialized");
    }

    const GET_USER_QUERY = gql`
      query GetUser($id: String!) {
        getUser(id: $id) {
          id
          name
          email
        }
      }
    `;

    const result = await client.query({
      query: GET_USER_QUERY,
      variables: { id: "123" },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.getUser).toEqual({
      id: "123",
      name: "John Doe",
      email: "john@example.com",
    });
  });

  it("should execute GraphQL mutation via Apollo Client", async () => {
    if (!client) {
      throw new Error("Client not initialized");
    }

    const CREATE_USER_MUTATION = gql`
      mutation CreateUser($name: String!, $email: String!) {
        createUser(name: $name, email: $email) {
          id
        }
      }
    `;

    const result = await client.mutate({
      mutation: CREATE_USER_MUTATION,
      variables: {
        name: "Jane Doe",
        email: "jane@example.com",
      },
    });

    expect(result.errors).toBeUndefined();
    expect(result.data).toBeDefined();
    expect(result.data.createUser).toEqual({
      id: "123",
    });
  });

  it("should handle validation errors", async () => {
    if (!client) {
      throw new Error("Client not initialized");
    }

    const GET_USER_QUERY = gql`
      query GetUser($id: String!) {
        getUser(id: $id) {
          id
          name
          email
        }
      }
    `;

    await expect(
      client.query({
        query: GET_USER_QUERY,
        variables: { id: 123 as any },
      }),
    ).rejects.toThrow();
  });

  it("should generate correct GraphQL schema", () => {
    const gql = orpcGraphQL(router);

    expect(gql.schema).toBeDefined();
    expect(gql.sdl).toContain("type Query");
    expect(gql.sdl).toContain("type Mutation");
    expect(gql.sdl).toContain("getUser");
    expect(gql.sdl).toContain("createUser");
  });
});

