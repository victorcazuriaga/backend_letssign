import { IsNotEmpty, IsString } from 'class-validator';
import { IsCnpj } from '../validators/cnpj.validator';

export class CreateCompanyRequest {
  @IsNotEmpty()
  @IsString()
  companyName: string;

  @IsCnpj()
  @IsString()
  cnpj: string;
}
