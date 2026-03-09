import { HttpException, HttpStatus } from "@nestjs/common";

export function padPrice(price: number): string {
  const scaled = Math.floor(price * 10 ** 2);
  return scaled.toString().padStart(1, "0");
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
