import { Prop, Schema } from '@nestjs/mongoose';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export abstract class AbstractDocument {
  @Prop({ types: SchemaTypes.ObjectId })
  id: Types.ObjectId;
}
