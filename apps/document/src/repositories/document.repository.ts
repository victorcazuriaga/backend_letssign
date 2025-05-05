import { AbstractRepository } from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { Document } from '../schemas/document.schema';

@Injectable()
export class DocumentRepository extends AbstractRepository<Document> {
  protected readonly logger = new Logger(DocumentRepository.name);

  constructor(
    @InjectModel(Document.name) documentModel: Model<Document>,
    @InjectConnection() connection: Connection,
  ) {
    super(documentModel, connection);
  }
}
