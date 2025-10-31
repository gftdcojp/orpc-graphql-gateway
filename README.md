# @gftdcojp/orpc-graphql-gateway

Automatically generate GraphQL schemas from oRPC routers. Use GraphQL with the same ease as `orpcOpenapi`.

## Overview

**"Write once in your router, get oRPC, OpenAPI, and GraphQL from the same type information."**

`@gftdcojp/orpc-graphql-gateway` treats your oRPC router as the single source of truth and automatically generates GraphQL schemas. This allows you to leverage GraphQL's versatility while maintaining type safety.

## Features

- 🎯 **Single Source of Truth**: Centralize all procedures in your oRPC router
- 🔄 **Automatic Conversion**: Automatic conversion from Zod schemas to GraphQL types
- 🚀 **Type Safe**: Leverages TypeScript's type system
- 🔌 **Easy Integration**: Simple integration with frameworks like Next.js
- 📦 **Same Mental Model**: Use GraphQL with the same ease as `orpcOpenapi`

## Installation

```bash
pnpm add @gftdcojp/orpc-graphql-gateway graphql graphql-yoga
```

## Getting Started

### 1. Define your oRPC router

```typescript
// src/server/orpc.ts
import { z } from "zod";
import { orpc } from "@orpc/server";

export const router = orpc.router({
  user: orpc.procedure
    .input(z.object({ id: z.string() }))
    .output(z.object({ id: z.string(), name: z.string() }))
    .handler(async ({ input }) => {
      return { id: input.id, name: "Jun" };
    }),
});
```

### 2. Generate GraphQL Gateway

```typescript
// src/server/graphql.ts
import { router } from "./orpc";
import { orpcGraphQL } from "@gftdcojp/orpc-graphql-gateway";

export const gql = orpcGraphQL(router);

export const { schema, sdl, createHandler } = gql;
```

### 3. Integrate with Next.js

```typescript
// src/app/api/graphql/route.ts
import { createHandler } from "@/server/graphql";

export { createHandler as GET, createHandler as POST };
```

That's it! Your GraphQL endpoint is now available at `/api/graphql`.

## API Reference

### `orpcGraphQL(router, options?)`

Generates a GraphQL Gateway from an oRPC router.

**Parameters:**

- `router`: oRPC router object
- `options`: Optional configuration
  - `namingPolicy`: Naming resolution policy (`"flat"` | `"nested"`)
  - `isQueryFn`: Custom function to determine if a procedure is a query
  - `federation`: Federation configuration
    - `enabled`: Enable Federation
    - `keyBy`: Entity key configuration

**Returns:** `OrpcGraphQLResult`

```typescript
interface OrpcGraphQLResult {
  /** GraphQL schema object */
  schema: GraphQLSchema;
  /** GraphQL SDL (string) */
  sdl: string;
  /** Federated SDL (only when federation is enabled) */
  subgraphSDL?: string;
  /** Function to create HTTP handler */
  createHandler: () => RequestHandler;
}
```

## Federation Support

Enable Federation with optional configuration:

```typescript
const gql = orpcGraphQL(router, {
  federation: {
    enabled: true,
    keyBy: {
      User: "id",
    },
  },
});

// Use with Apollo Gateway
export const subgraphSDL = gql.subgraphSDL;
```

## Zod → GraphQL Conversion Rules

| Zod               | GraphQL                    |
| ----------------- | -------------------------- |
| `z.string()`      | `GraphQLString`            |
| `z.number()`      | `GraphQLFloat` or `Int`    |
| `z.boolean()`      | `GraphQLBoolean`           |
| `z.array(x)`      | `GraphQLList`              |
| `z.object({...})` | `GraphQLInputObjectType`   |
| `z.enum([...])`   | `GraphQLEnumType`          |
| `z.nullable(x)`   | nullable                   |
| `z.union(...)`    | `GraphQLUnionType` (output) |

## Naming Policy

Nested routers are converted to flat names:

- `user.get` → `user_get`
- `post.create` → `post_create`

## Lower-Level API

For advanced use cases, you can use lower-level APIs:

```typescript
import { buildGraphQLSchemaFromOrpc } from "@gftdcojp/orpc-graphql-gateway";

const schema = buildGraphQLSchemaFromOrpc(router);
```

## Documentation

For more information, see the [oRPC OpenAPI Getting Started Guide](https://orpc.unnoq.com/docs/openapi/getting-started).

## License

MIT
