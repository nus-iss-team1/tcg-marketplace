import { Transform } from "class-transformer";
import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength, Min } from "class-validator";

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @IsOptional()
  @Transform(() => undefined)
  updatedAt!: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly gameName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly cardName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  readonly price?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly cardCondition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly psaGrade?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly edition?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly language?: string;

  @IsOptional()
  @IsBoolean()
  readonly holographic?: boolean;

  @IsOptional()
  @IsString()
  listingStatus!: "ACTIVE" | "SOLD" | "DELETED";
}
