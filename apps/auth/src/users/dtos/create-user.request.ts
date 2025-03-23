import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IsCpf } from '../validators/cpf.validator';

export class CreateUserRequest {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsCpf()
  @IsString()
  cpf: string;

  @IsOptional()
  @IsString()
  role?: 'root' | 'admin' | 'member';

  @IsOptional()
  @IsString()
  status?: 'active' | 'pending' | 'suspended';
}
