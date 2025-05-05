import { AbstractDocument } from '@app/common';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

// @Schema({ versionKey: false, timestamps: true })
// export class Signer extends AbstractDocument {
//   @Prop({ required: true })
//   email: string;

//   @Prop()
//   name?: string;

//   @Prop()
//   phone?: string;

//   @Prop({ default: 'WAITING' })
//   status: 'WAITING' | 'SIGNED' | 'DECLINED';

//   @Prop()
//   signedAt?: Date;

//   @Prop()
//   signatureHash?: string;

//   @Prop({ default: true })
//   otpRequired: boolean;

//   @Prop({ default: 'email' })
//   authMethod: 'email' | 'otp' | 'naked';
// }

// export const SignerSchema = SchemaFactory.createForClass(Sign 
// er);

@Schema({ versionKey: false, timestamps: true })
export class Document extends AbstractDocument {
  @Prop({ required: true })
   fileId: string;

  @Prop({})
  title?: string;

  @Prop({ type: Types.ObjectId, ref: 'users', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  fileKey: string;

  @Prop({ required: true })
  sha256: string;

  @Prop({ default: 'PENDING' })
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';

  @Prop({ type: [Types.ObjectId], ref: 'signer', default: [] })
  signers?: Types.ObjectId[];

  @Prop({ type: String })
  auditTrailId?: string;

  @Prop({ type: Types.Map, of: String })
  metadata?: Map<string, string>;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
