import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min
} from "class-validator";

export class CreateListingDto {
  @IsOptional()
  @Transform(() => undefined)
  listingId!: string;

  @IsNotEmpty()
  @IsString()
  readonly sellerId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

  @IsOptional()
  @Transform(() => undefined)
  createdAt!: number;

  @IsOptional()
  @Transform(() => undefined)
  updatedAt!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly gameName!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly cardName!: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  readonly price!: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly cardCondition!: string;

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
  @Transform(() => undefined)
  listingStatus!: "ACTIVE" | "SOLD" | "DELETED";
}
