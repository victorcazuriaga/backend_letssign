import { IsString, IsNotEmpty } from 'class-validator';

export class ValidateOtpDto {
  @IsString()
  @IsNotEmpty()
  readonly otp: string;
}
