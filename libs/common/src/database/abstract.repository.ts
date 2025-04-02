import { Logger, NotFoundException } from '@nestjs/common';
import {
  FilterQuery,
  PopulateOptions,
  Model,
  Types,
  UpdateQuery,
  SaveOptions,
  Connection,
  ClientSession,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';

export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }
  async findOneIncludingPassword(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });
    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      // // throw new NotFoundException('Document not found.');
      return false as unknown as TDocument;
    }
    return document as unknown as TDocument;
  }
  async findOne(
    filterQuery: FilterQuery<TDocument>,
    populateOptions?: PopulateOptions,
  ): Promise<TDocument> {
    const document = await this.model
      .findOne(filterQuery, {}, { lean: true })
      .select('-password');
    if (populateOptions) {
      await this.model.populate(document, populateOptions);
    }

    if (!document) {
      this.logger.warn('Document not found with filterQuery', filterQuery);
      // throw new NotFoundException('Document not found.');
      return false as unknown as TDocument;
    }
    return document as unknown as TDocument;
  }

  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndUpdate(filterQuery, update, {
        new: true,
      })
      .select('-password');
    if (!document) {
      this.logger.warn(`Document not found: ${JSON.stringify(filterQuery)}`);
      throw new NotFoundException();
    }
    return document;
  }

  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ): Promise<TDocument | null> {
    return (await this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    })) as unknown as TDocument | null;
  }
  async findOneAndDelete(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model
      .findOneAndDelete(filterQuery)
      .select('-password');
    if (!document) {
      this.logger.warn(`Document not found: ${JSON.stringify(filterQuery)}`);
      throw new NotFoundException();
    }
    return document;
  }

  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    return (await this.model
      .find(filterQuery, {}, { lean: true })
      .select('-password')
      .exec()) as unknown as TDocument[];
  }
  async startTransaction(): Promise<ClientSession> {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
