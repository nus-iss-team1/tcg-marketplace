import { IsNumberString, IsOptional, IsString } from "class-validator";

export class QueryListingDto {
  @IsOptional()
  @IsNumberString()
  readonly limit?: number;

  @IsOptional()
  @IsString()
  readonly cursor?: string;
}
