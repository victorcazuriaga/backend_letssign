import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';

@Schema({ timestamps: true })
export class Otp extends AbstractDocument {
  @Prop({ required: true, index: true }) // Index para buscas rápidas
  email: string;

  @Prop({ required: true, index: true })
  otp: string; // Armazena o hash do OTP ao invés do código puro

  @Prop({ default: () => new Date(Date.now() + 10 * 60 * 1000), expires: 600 }) // Expiração automática após 10 minutos
  expiresAt: Date;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ default: 0 })
  attempts: number; // Contador de tentativas de validação para evitar brute-force
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
