import { IsNotEmpty, IsString } from "class-validator";
import { IsULID } from "../../common/decorators/is-ulid.decorator";

export class JoinRoomDto {
  @IsNotEmpty()
  @IsString()
  readonly conversationId!: string;
}

export class MessageSeenDto {
  @IsNotEmpty()
  @IsString()
  readonly conversationId!: string;

  @IsNotEmpty()
  @IsULID()
  readonly messageId!: string;
}
