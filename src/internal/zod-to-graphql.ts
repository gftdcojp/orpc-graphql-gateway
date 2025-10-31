/**
 * @fileoverview Zod → GraphQL型変換ユーティリティ
 * 
 * このモジュールは、oRPC routerで使用されるZodスキーマを
 * GraphQL型システムに変換する責務を持ちます。
 * 
 * @see {@link https://github.com/gftdcojp/orpc-graphql story.jsonnet process:zod-to-gql}
 * 
 * @module internal/zod-to-graphql
 */

import {
  GraphQLScalarType,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
  GraphQLBoolean,
  GraphQLList,
  GraphQLNonNull,
  GraphQLInputObjectType,
  GraphQLObjectType,
  GraphQLEnumType,
  GraphQLUnionType,
  GraphQLType,
  GraphQLInputType,
  GraphQLOutputType,
  GraphQLFieldConfigArgumentMap,
} from "graphql";
import { z } from "zod";

/**
 * ZodスキーマをGraphQL型に変換する際のコンテキスト
 * 
 * @property typeCache - 型キャッシュ（循環参照防止）
 * @property isInput - Input型として変換するか（true: InputType, false: OutputType）
 */
interface ConversionContext {
  typeCache: Map<z.ZodTypeAny, GraphQLType>;
  isInput: boolean;
}

/**
 * Zodのプリミティブ型をGraphQLスカラー型に変換
 * 
 * @param zodType - Zod型
 * @returns GraphQLスカラー型
 */
function zodToGraphQLScalar(zodType: z.ZodTypeAny): GraphQLScalarType | null {
  // z.string() → GraphQLString
  if (zodType instanceof z.ZodString) {
    return GraphQLString;
  }

  // z.number() → GraphQLFloat or GraphQLInt
  if (zodType instanceof z.ZodNumber) {
    // TODO: 整数判定を追加（z.int()やz.literal(1)など）
    return GraphQLFloat;
  }

  // z.boolean() → GraphQLBoolean
  if (zodType instanceof z.ZodBoolean) {
    return GraphQLBoolean;
  }

  // z.nullable() や z.optional() は内側を処理
  if (zodType instanceof z.ZodNullable) {
    return zodToGraphQLScalar((zodType as any)._def.innerType);
  }
  if (zodType instanceof z.ZodOptional) {
    return zodToGraphQLScalar((zodType as any)._def.innerType);
  }

  // z.literal() → スカラー（文字列リテラルの場合はGraphQLString）
  if (zodType instanceof z.ZodLiteral) {
    const value = (zodType as any)._def.value;
    if (typeof value === "string") {
      return GraphQLString;
    }
    if (typeof value === "number") {
      return Number.isInteger(value) ? GraphQLInt : GraphQLFloat;
    }
    if (typeof value === "boolean") {
      return GraphQLBoolean;
    }
  }

  return null;
}

/**
 * Zod enumをGraphQL EnumTypeに変換
 * 
 * @param zodType - Zod enum型
 * @param name - GraphQL型名
 * @returns GraphQLEnumType
 */
function zodEnumToGraphQL(
  zodType: z.ZodEnum<any>,
  name: string,
): GraphQLEnumType {
  const values = (zodType as any)._def.values;
  return new GraphQLEnumType({
    name,
    values: Object.fromEntries(
      values.map((value: string) => [value, { value }]),
    ),
  });
}

/**
 * Zod objectをGraphQL InputObjectTypeまたはObjectTypeに変換
 * 
 * @param zodType - Zod object型
 * @param name - GraphQL型名
 * @param context - 変換コンテキスト
 * @returns GraphQLInputObjectType or GraphQLObjectType
 */
function zodObjectToGraphQL(
  zodType: z.ZodObject<any>,
  name: string,
  context: ConversionContext,
): GraphQLInputObjectType | GraphQLObjectType {
  // キャッシュチェック
  const cached = context.typeCache.get(zodType);
  if (cached) {
    return cached as GraphQLInputObjectType | GraphQLObjectType;
  }

  const shape = (zodType as any)._def.shape;
  const fields: Record<string, any> = {};

  for (const [fieldName, fieldSchema] of Object.entries(shape)) {
    const fieldType = zodToGraphQLType(fieldSchema as z.ZodTypeAny, context);
    if (!fieldType) {
      continue;
    }

    // optional/nullable判定
    const isOptional =
      fieldSchema instanceof z.ZodOptional ||
      fieldSchema instanceof z.ZodNullable;

    // fieldTypeが既にGraphQLNonNullの場合はunwrapしてから判定
    const baseType = fieldType instanceof GraphQLNonNull
      ? (fieldType as any).ofType
      : fieldType;

    fields[fieldName] = {
      type: isOptional ? baseType : new GraphQLNonNull(baseType),
    };
  }

  const graphQLType = context.isInput
    ? new GraphQLInputObjectType({
        name,
        fields,
      })
    : new GraphQLObjectType({
        name,
        fields,
      });

  context.typeCache.set(zodType, graphQLType);
  return graphQLType;
}

/**
 * Zod arrayをGraphQL Listに変換
 * 
 * @param zodType - Zod array型
 * @param context - 変換コンテキスト
 * @returns GraphQLList
 */
function zodArrayToGraphQL(
  zodType: z.ZodArray<any>,
  context: ConversionContext,
): GraphQLList<any> {
  // Zod v4では_def.elementが実際のZod型インスタンス
  const elementZodType = (zodType as any)._def.element;
  if (!elementZodType) {
    throw new Error("Cannot find array element type");
  }
  const elementType = zodToGraphQLType(elementZodType, context);
  if (!elementType) {
    throw new Error("Array element type cannot be converted to GraphQL");
  }
  // elementTypeが既にGraphQLNonNullの場合はunwrap
  const baseElementType = elementType instanceof GraphQLNonNull
    ? (elementType as any).ofType
    : elementType;
  return new GraphQLList(baseElementType);
}

/**
 * Zod unionをGraphQL UnionTypeに変換（Output型の場合）
 * またはdiscriminated unionとしてObjectTypeに変換（Input型の場合）
 * 
 * @param zodType - Zod union型
 * @param name - GraphQL型名
 * @param context - 変換コンテキスト
 * @returns GraphQLUnionType or GraphQLInputObjectType
 */
function zodUnionToGraphQL(
  zodType: z.ZodUnion<any>,
  name: string,
  context: ConversionContext,
): GraphQLUnionType | GraphQLInputObjectType {
  const options = (zodType as any)._def.options;

  // Input型の場合は、discriminated unionとして扱う
  // （GraphQLはinput unionをサポートしていないため）
  if (context.isInput) {
    // 各オプションを個別のInputObjectTypeとして定義
    // 実際の実装では、discriminatorフィールドを追加する必要がある
    // ここでは簡略化して最初のオプションを使用
    const firstOption = options[0];
    if (firstOption instanceof z.ZodObject) {
      const result = zodObjectToGraphQL(firstOption, `${name}_Option`, context);
      // Input型の場合はInputObjectTypeのみを返す
      if (result instanceof GraphQLInputObjectType) {
        return result;
      }
      throw new Error("Expected InputObjectType for input union");
    }
    throw new Error(
      "Union input types must have object options for GraphQL conversion",
    );
  }

  // Output型の場合はUnionTypeとして扱う
  const types = options
    .map((option: z.ZodTypeAny) => zodToGraphQLType(option, context))
    .filter((t: GraphQLType | null): t is GraphQLOutputType => t !== null);

  if (types.length === 0) {
    throw new Error("Union type must have at least one valid option");
  }

  return new GraphQLUnionType({
    name,
    types,
    resolveType: () => {
      // 型解決ロジック（実際の実装では、valueの__typenameなどから判定）
      return types[0];
    },
  });
}

/**
 * Zod型をGraphQL型に変換（メイン関数）
 * 
 * @param zodType - 変換するZod型
 * @param context - 変換コンテキスト
 * @param typeName - 型名（オブジェクト型の場合に使用）
 * @returns GraphQL型
 */
export function zodToGraphQLType(
  zodType: z.ZodTypeAny,
  context: ConversionContext,
  typeName?: string,
): GraphQLType | null {
  // nullable/optional処理
  let innerType = zodType;
  let isNullable = false;

  if (zodType instanceof z.ZodNullable) {
    innerType = (zodType as any)._def.innerType;
    isNullable = true;
  } else if (zodType instanceof z.ZodOptional) {
    innerType = (zodType as any)._def.innerType;
    isNullable = true;
  }

  // スカラー型の変換
  const scalar = zodToGraphQLScalar(innerType);
  if (scalar) {
    return isNullable ? scalar : new GraphQLNonNull(scalar);
  }

  // enum型の変換
  if (innerType instanceof z.ZodEnum) {
    const name = typeName || `Enum_${Math.random().toString(36).substring(7)}`;
    const enumType = zodEnumToGraphQL(innerType, name);
    return isNullable ? enumType : new GraphQLNonNull(enumType);
  }

  // object型の変換
  if (innerType instanceof z.ZodObject) {
    const name =
      typeName || `Object_${Math.random().toString(36).substring(7)}`;
    const objectType = zodObjectToGraphQL(innerType, name, context);
    return isNullable ? objectType : new GraphQLNonNull(objectType);
  }

  // array型の変換
  if (innerType instanceof z.ZodArray) {
    const listType = zodArrayToGraphQL(innerType, context);
    return isNullable ? listType : new GraphQLNonNull(listType);
  }

  // union型の変換
  if (innerType instanceof z.ZodUnion) {
    const name = typeName || `Union_${Math.random().toString(36).substring(7)}`;
    const unionType = zodUnionToGraphQL(innerType, name, context);
    return isNullable ? unionType : new GraphQLNonNull(unionType);
  }

  // その他の型（z.literal(), z.tuple()など）は未対応
  return null;
}

/**
 * Zod型をGraphQL InputTypeに変換
 * 
 * @param zodType - Zod型
 * @param typeName - 型名
 * @returns GraphQLInputType
 */
export function zodToGraphQLInputType(
  zodType: z.ZodTypeAny,
  typeName?: string,
): GraphQLInputType {
  const context: ConversionContext = {
    typeCache: new Map(),
    isInput: true,
  };

  const graphQLType = zodToGraphQLType(zodType, context, typeName);
  if (!graphQLType) {
    throw new Error(`Cannot convert Zod type to GraphQL InputType`);
  }

  // InputTypeチェック（GraphQLObjectTypeでないことを確認）
  if (graphQLType instanceof GraphQLObjectType) {
    throw new Error(`Converted type is not an InputType`);
  }

  return graphQLType as GraphQLInputType;
}

/**
 * Zod型をGraphQL OutputTypeに変換
 * 
 * @param zodType - Zod型
 * @param typeName - 型名
 * @returns GraphQLOutputType
 */
export function zodToGraphQLOutputType(
  zodType: z.ZodTypeAny,
  typeName?: string,
): GraphQLOutputType {
  const context: ConversionContext = {
    typeCache: new Map(),
    isInput: false,
  };

  const graphQLType = zodToGraphQLType(zodType, context, typeName);
  if (!graphQLType) {
    throw new Error(`Cannot convert Zod type to GraphQL OutputType`);
  }

  // OutputTypeチェック（GraphQLInputObjectTypeでないことを確認）
  if (graphQLType instanceof GraphQLInputObjectType) {
    throw new Error(`Converted type is not an OutputType`);
  }

  return graphQLType as GraphQLOutputType;
}

/**
 * Zod objectをGraphQLフィールド引数に変換
 * 
 * @param zodType - Zod object型（入力スキーマ）
 * @returns GraphQLFieldConfigArgumentMap
 */
export function zodToGraphQLArgs(
  zodType: z.ZodTypeAny,
): GraphQLFieldConfigArgumentMap {
  if (!(zodType instanceof z.ZodObject)) {
    throw new Error("Input schema must be a ZodObject");
  }

  const shape = (zodType as any)._def.shape;
  const args: GraphQLFieldConfigArgumentMap = {};

  const context: ConversionContext = {
    typeCache: new Map(),
    isInput: true,
  };

  for (const [argName, argSchema] of Object.entries(shape)) {
    const argType = zodToGraphQLType(argSchema as z.ZodTypeAny, context);
    if (!argType) {
      continue;
    }

    // InputTypeチェック
    if (argType instanceof GraphQLObjectType) {
      throw new Error(`Argument ${argName} cannot be an ObjectType`);
    }

    // optional/nullable判定
    const isOptional =
      argSchema instanceof z.ZodOptional ||
      argSchema instanceof z.ZodNullable;

    // argTypeが既にGraphQLNonNullの場合はそのまま使用
    const baseType = argType instanceof GraphQLNonNull
      ? (argType as any).ofType
      : (argType as GraphQLInputType);

    args[argName] = {
      type: isOptional ? baseType : new GraphQLNonNull(baseType),
    };
  }

  return args;
}

