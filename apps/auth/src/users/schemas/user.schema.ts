import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Types } from 'mongoose';
import { IsCpfConstraint } from '../validators/cpf.validator';

@Schema({ versionKey: false, timestamps: true })
export class User extends AbstractDocument {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  phone?: string;

  @Prop()
  name: string;

  @Prop()
  lastName: string;
  @Prop({
    unique: true,
    validate: {
      validator: (cpf: string) => new IsCpfConstraint().validate(cpf),
      message: 'CPF is not valid',
    },
  })
  cpf: string;

  @Prop({ type: Types.ObjectId, ref: 'Company' })
  company?: Types.ObjectId;

  @Prop({ enum: ['root', 'admin', 'member'], default: 'member' })
  role?: 'root' | 'admin' | 'member';

  @Prop({ default: 'pending', enum: ['active', 'pending', 'suspended'] })
  status: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
