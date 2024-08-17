import {
  IsCurrency,
  IsEmail,
  IsPhoneNumber,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsNumberString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsString()
  card_number: string;
  @IsNotEmpty()
  @IsString()
  cvv: string;
  @IsNotEmpty()
  @IsString()
  expiry_month: string;
  @IsNotEmpty()
  @IsString()
  expiry_year: string;
  @IsNotEmpty()
  @IsCurrency()
  currency: string;
  @IsNotEmpty()
  @IsNumberString()
  amount: string;
  @IsNotEmpty()
  @IsUrl()
  redirect_url: string;
  @IsNotEmpty()
  @IsString()
  fullname: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsPhoneNumber()
  phone_number: string;
  @IsOptional()
  enckey: string;
  @IsNotEmpty()
  @IsString()
  tx_ref: string;
  @IsOptional()
  authourization: {
    mode: string;
    fields: [pin: string];
    pin: string;
  };
}
