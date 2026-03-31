import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { MessageType } from "../types/message.type";
import { IsULID } from "../../common/decorators/is-ulid.decorator";

export class CreateMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly recipientId!: string;

  @IsNotEmpty()
  @IsString()
  readonly content!: string;

  @IsNotEmpty()
  @IsEnum(MessageType)
  readonly messageType!: MessageType;

  @IsOptional()
  @IsString()
  readonly replyTo?: string;
}

export class EditMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly conversationId!: string;

  @IsNotEmpty()
  @IsULID()
  readonly messageId!: string;

  @IsNotEmpty()
  @IsString()
  readonly content!: string;
}

export class DeleteMessageDto {
  @IsNotEmpty()
  @IsString()
  readonly conversationId!: string;

  @IsNotEmpty()
  @IsULID()
  readonly messageId!: string;
}
