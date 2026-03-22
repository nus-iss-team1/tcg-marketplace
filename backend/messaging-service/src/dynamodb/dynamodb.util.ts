import { FieldOptions } from "./dynamodb.type";

export function field(options: FieldOptions) {
  return options;
}

export function buildProjection<
  T extends Record<string, FieldOptions>,
  K extends readonly (keyof T)[]
>(schema: T, view?: K) {
  const keys = view
    ? (view as readonly string[]).filter((key) => !schema[key].hidden)
    : Object.keys(schema).filter((key) => !schema[key].hidden);

  return {
    ProjectionExpression: keys.map((k) => `#${k}`).join(", "),
    ExpressionAttributeNames: Object.fromEntries(keys.map((k) => [`#${k}`, k]))
  };
}
