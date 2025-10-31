{
  "@context": {
    "@vocab": "https://schema.org/",
    "owl": "http://www.w3.org/2002/07/owl#",
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "process": "https://gftd.ai/process#"
  },
  "@type": "process:Network",
  "@id": "orpc-graphql:network",
  "name": "oRPC GraphQL Emitter Process Network",
  "description": "oRPC routerを中心としてGraphQL schemaを自動生成するプロセスネットワーク",
  "nodes": [
    {
      "@id": "process:project-setup",
      "@type": "process:Node",
      "name": "プロジェクト基盤構築",
      "dependencies": [],
      "outputs": ["package.json", "tsconfig.json", "biome.json"]
    },
    {
      "@id": "process:zod-to-gql",
      "@type": "process:Node",
      "name": "Zod → GraphQL型変換",
      "dependencies": ["process:project-setup"],
      "outputs": ["src/internal/zod-to-graphql.ts"]
    },
    {
      "@id": "process:router-analyzer",
      "@type": "process:Node",
      "name": "oRPC router解析",
      "dependencies": ["process:zod-to-gql"],
      "outputs": ["src/internal/router-analyzer.ts"]
    },
    {
      "@id": "process:schema-builder",
      "@type": "process:Node",
      "name": "GraphQL schema生成",
      "dependencies": ["process:router-analyzer"],
      "outputs": ["src/internal/schema-builder.ts"]
    },
    {
      "@id": "process:resolver-delegate",
      "@type": "process:Node",
      "name": "Resolver委譲実装",
      "dependencies": ["process:schema-builder"],
      "outputs": ["src/internal/resolver-delegate.ts"]
    },
    {
      "@id": "process:nextjs-integration",
      "@type": "process:Node",
      "name": "Next.js統合",
      "dependencies": ["process:resolver-delegate"],
      "outputs": ["src/app/api/graphql/route.ts"]
    },
    {
      "@id": "process:testing",
      "@type": "process:Node",
      "name": "テスト実装",
      "dependencies": ["process:nextjs-integration"],
      "outputs": ["src/**/*.test.ts"]
    }
  ],
  "edges": [
    {
      "@id": "edge:setup-to-zod",
      "from": "process:project-setup",
      "to": "process:zod-to-gql"
    },
    {
      "@id": "edge:zod-to-analyzer",
      "from": "process:zod-to-gql",
      "to": "process:router-analyzer"
    },
    {
      "@id": "edge:analyzer-to-builder",
      "from": "process:router-analyzer",
      "to": "process:schema-builder"
    },
    {
      "@id": "edge:builder-to-resolver",
      "from": "process:schema-builder",
      "to": "process:resolver-delegate"
    },
    {
      "@id": "edge:resolver-to-nextjs",
      "from": "process:resolver-delegate",
      "to": "process:nextjs-integration"
    },
    {
      "@id": "edge:nextjs-to-test",
      "from": "process:nextjs-integration",
      "to": "process:testing"
    }
  ],
  "topologicalOrder": [
    "process:project-setup",
    "process:zod-to-gql",
    "process:router-analyzer",
    "process:schema-builder",
    "process:resolver-delegate",
    "process:nextjs-integration",
    "process:testing"
  ]
}

