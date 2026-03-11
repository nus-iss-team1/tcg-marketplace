import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import { ListingStatus, OrderListing, SortListing } from "../types/marketplace.type";

class PaymentMethodDto {
  @IsDefined()
  @IsBoolean()
  readonly cash!: boolean;

  @IsDefined()
  @IsBoolean()
  readonly paynow!: boolean;

  @IsDefined()
  @IsBoolean()
  readonly bank!: boolean;
}

class BaseListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly setName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly cardId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly rarity?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }: { value: number }) => Number(Number(value).toFixed(2)))
  readonly price!: number;

  @ValidateNested()
  @Type(() => PaymentMethodDto)
  readonly paymentMethod!: PaymentMethodDto;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly pickup?: string;

  @IsOptional()
  @IsEnum(ListingStatus)
  listingStatus!: ListingStatus;
}

export class CreateListingDto extends BaseListingDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly gameName!: string;

  @IsOptional()
  @Transform(() => undefined)
  sellerId!: string;

  @IsOptional()
  @Transform(() => undefined)
  listingId!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly cardName!: string;

  @IsOptional()
  @Transform(() => undefined)
  createdAt!: number;

  @IsOptional()
  @Transform(() => undefined)
  updatedAt!: number;
}

export class UpdateListingDto extends BaseListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly cardName?: string;

  @IsOptional()
  @Transform(() => undefined)
  updatedAt!: number;
}

export class QueryListingDto {
  @IsOptional()
  @IsNumberString()
  readonly limit?: number;

  @IsOptional()
  @IsString()
  readonly cursor?: string;

  @IsOptional()
  @IsEnum(SortListing)
  readonly sort?: SortListing;

  @IsOptional()
  @IsEnum(OrderListing)
  readonly order?: OrderListing;
}
