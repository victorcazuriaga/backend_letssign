import { IsString, IsOptional } from 'class-validator';
import { IsCpf } from '../validators/cpf.validator';

export class UpdateUserRequest {
  @IsString()
  @IsOptional()
  readonly name?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  readonly email?: string;

  @IsCpf()
  @IsOptional()
  readonly cpf?: string;

  @IsString()
  @IsOptional()
  readonly role?: string;
}
