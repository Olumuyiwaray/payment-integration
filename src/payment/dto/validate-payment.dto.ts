import { IsNotEmpty, IsString } from 'class-validator';

export class ValidationDTO {
  @IsString()
  @IsNotEmpty()
  otp: string;
}
