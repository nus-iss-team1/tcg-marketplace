import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class QueryCardDto {
  @IsNotEmpty()
  @IsString()
  readonly gameName!: string;

  @IsOptional()
  @IsString()
  readonly cardName?: string;
}
