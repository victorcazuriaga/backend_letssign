import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Types } from 'mongoose';
import { IsCnpjConstraint } from '../validators/cnpj.validator';

@Schema({ versionKey: false, timestamps: true })
export class Company extends AbstractDocument {
  @Prop({ required: true, unique: false })
  companyName: string;

  @Prop({
    required: true,
    unique: true,
    validate: {
      validator: (cnpj: string) => new IsCnpjConstraint().validate(cnpj),
      message: 'CNPJ is not valid',
    },
  })
  cnpj: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[];
}

export const CompanySchema = SchemaFactory.createForClass(Company);
