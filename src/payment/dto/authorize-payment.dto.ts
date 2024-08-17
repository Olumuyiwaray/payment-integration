import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class AuthorizationDto {
  @IsOptional()
  @IsNumberString()
  pin: string;
  @IsOptional()
  @IsString()
  city: string;
  @IsOptional()
  @IsString()
  address: string;
  @IsOptional()
  @IsString()
  state: string;
  @IsOptional()
  @IsString()
  country: string;
  @IsOptional()
  @IsString()
  zipcode: string;
}
