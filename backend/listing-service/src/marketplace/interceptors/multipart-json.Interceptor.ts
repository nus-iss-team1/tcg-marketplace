import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException
} from "@nestjs/common";
import { Observable } from "rxjs";
import { Request } from "express";

@Injectable()
export class MultipartJsonInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    if (!request.body || typeof request.body !== "object") {
      return next.handle();
    }

    // update paymentMethod from string to JSON object
    const body = request.body as Record<string, unknown>;
    const value = body["paymentMethod"];

    if (typeof value === "string") {
      try {
        body["paymentMethod"] = JSON.parse(value);
      } catch {
        throw new BadRequestException("Invalid paymentMethod value");
      }
    }

    return next.handle();
  }
}
