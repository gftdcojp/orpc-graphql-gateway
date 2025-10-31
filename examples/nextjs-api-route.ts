/**
 * @fileoverview Next.js API Route統合例
 * 
 * Next.js App Routerでの使用方法を示します。
 * このファイルは `src/app/api/graphql/route.ts` に配置します。
 * 
 * @module examples/nextjs-api-route
 */

import { createHandler } from "./graphql-server.js";

// Next.js App Routerでは、GETとPOSTをエクスポートする
export { createHandler as GET, createHandler as POST };

