# Apollo Demo セットアップガイド

## 問題: GraphQLスキーマのモジュール間不一致

Apollo Serverと`@gftdcojp/orpc-graphql-gateway`が異なる`graphql`インスタンスを使用している場合、以下のエラーが発生する可能性があります：

```
Cannot use GraphQLSchema from another module or realm
```

## 解決方法

### 1. pnpmのoverridesを使用（推奨）

`package.json`に以下を追加：

```json
{
  "pnpm": {
    "overrides": {
      "graphql": "^16.9.0"
    }
  }
}
```

### 2. 依存関係の確認

```bash
pnpm list graphql
```

すべてのパッケージが同じ`graphql`バージョンを使用していることを確認してください。

### 3. クリーンインストール

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## テスト実行

簡易テスト（Apollo Serverを使用しない）：

```bash
pnpm test examples/apollo-demo/apollo-demo-simple.test.ts
```

完全なテスト（Apollo Server & Client）：

```bash
pnpm test examples/apollo-demo/apollo-demo.test.ts
```

## 手動実行

### サーバー起動

```bash
cd examples/apollo-demo
pnpm server
```

### クライアント実行

別のターミナルで：

```bash
cd examples/apollo-demo
pnpm client
```

