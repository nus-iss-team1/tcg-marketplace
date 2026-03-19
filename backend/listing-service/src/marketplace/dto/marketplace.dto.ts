import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested
} from "class-validator";
import { FilterListing, ImageAction, OrderListing, SortListing } from "../types/marketplace.type";

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
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly description?: string;

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

  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly pickup?: string;
}

export class CreateListingDto extends BaseListingDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly gameName!: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  readonly cardName!: string;

  @IsDefined()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod!: PaymentMethodDto;
}

export class UpdateListingDto extends BaseListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  readonly cardName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentMethodDto)
  paymentMethod?: PaymentMethodDto;

  @IsNotEmpty()
  @IsIn([ImageAction.KEEP, ImageAction.REPLACE])
  readonly frontImageAction!: ImageAction;

  @IsNotEmpty()
  @IsEnum(ImageAction)
  readonly backImageAction!: ImageAction;
}

export class QueryListingDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
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

  @IsOptional()
  @IsEnum(FilterListing)
  readonly filter?: FilterListing;

  @IsOptional()
  @IsString()
  readonly filterValue?: string;
}

export class QuerySellerListingDto extends QueryListingDto {
  @IsOptional()
  @IsIn([FilterListing.cardName, FilterListing.title])
  declare readonly filter?: FilterListing;
}
