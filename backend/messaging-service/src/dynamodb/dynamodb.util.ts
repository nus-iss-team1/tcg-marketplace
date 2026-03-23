import { HttpException, HttpStatus } from "@nestjs/common";
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

export function handleDynamoError(error: unknown): never {
  if (error instanceof Error) {
    switch (error.name) {
      case "ConditionalCheckFailedException":
        throw new HttpException("Condition failed", HttpStatus.BAD_REQUEST);
      case "ValidationException":
        throw new HttpException("Invalid request", HttpStatus.BAD_REQUEST);
      case "ProvisionedThroughputExceededException":
      case "ThrottlingException":
        throw new HttpException("Too many requests", HttpStatus.TOO_MANY_REQUESTS);
      case "InternalServerError":
        throw new HttpException("Internal DynamoDB error", HttpStatus.INTERNAL_SERVER_ERROR);
      case "AccessDeniedException":
        throw new HttpException("Access denied", HttpStatus.FORBIDDEN);
      default:
        throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  throw new HttpException("Unknown error", HttpStatus.INTERNAL_SERVER_ERROR);
}
