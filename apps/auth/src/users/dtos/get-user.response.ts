import { IsOptional, IsString } from 'class-validator';

type Company = {
  _id: string;
  companyName: string;
  cnpj: string;
  users: string[];
};

export class GetUserResponse {
  @IsString()
  _id: string;

  @IsString()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  companyName?: Company;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  role?: 'owner' | 'admin' | 'member';

  @IsOptional()
  @IsString()
  status?: 'active' | 'pending' | 'suspended';

  @IsOptional()
  @IsString()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  updatedAt?: Date;
}
