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
import { ImageAction, OrderListing, SortListing } from "../types/marketplace.type";

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
  @IsEnum(ImageAction)
  readonly frontImageAction!: ImageAction;

  @IsNotEmpty()
  @IsEnum(ImageAction)
  readonly backImageAction!: ImageAction;
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
