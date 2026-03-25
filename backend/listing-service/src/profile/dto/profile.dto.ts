import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from "class-validator";

class PreferredPaymentDto {
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

export class CreateProfileDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  readonly displayName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferredPaymentDto)
  readonly preferredPayment?: PreferredPaymentDto;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  readonly displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  readonly address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  readonly bio?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => PreferredPaymentDto)
  readonly preferredPayment?: PreferredPaymentDto;
}
