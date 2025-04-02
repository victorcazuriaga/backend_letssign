import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { AbstractRepository } from '@app/common';
import { Otp } from '../schemas/otp.schema';
@Injectable()
export class OtpRepository extends AbstractRepository<Otp> {
  protected readonly logger = new Logger(OtpRepository.name);

  constructor(
    @InjectModel(Otp.name) otpModel: Model<Otp>,
    @InjectConnection() connection: Connection,
  ) {
    super(otpModel, connection);
  }
}
