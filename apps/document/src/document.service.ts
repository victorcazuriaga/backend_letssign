import { Injectable } from '@nestjs/common';
import { R2Adapter } from './adapters/r2-storage.adapter';
import { DocumentRepository } from './repositories/document.repository';
import { Types } from 'mongoose';
import { GetDocumentDto } from './dtos/get-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    private readonly r2Adapter: R2Adapter,
    private readonly documentRepository: DocumentRepository,
  ) {}

  async uploadDocument(
    file: Express.Multer.File,
    userId: Types.ObjectId,
  ): Promise<Types.ObjectId> {
    const { key, sha256, fileId } = await this.r2Adapter.upload(
      file,
      userId.toString(),
    );

    const document = await this.documentRepository.create({
      fileId: fileId,
      userId: userId,
      fileKey: key,
      sha256: sha256,
    });

    return document._id;
  }

  async updateDetailsDocument(
    documentId: string,
    userId: string,
    updatedData: Partial<{ [key: string]: any }>,
  ): Promise<any> {
    const document = await this.documentRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(documentId), userId: userId },
      { $set: { updatedAt: new Date(), ...updatedData } },
    );
    if (!document) {
      throw new Error('Document not found or you do not have permission to update it');
    }

    return document;
  }

  async updateSignersDocument(signers: string[], documentId: string): Promise<any> {
    const document = await this.documentRepository.findOneAndUpdate(
      { _id: new Types.ObjectId(documentId) },
      { $set: { updatedAt: new Date(), signers: signers } },
    );
    if (!document) {
      throw new Error('Document not found or you do not have permission to update it');
    }
    return document;
  }
  
  
  async getDocumentUrl(fileKey: string): Promise<string> {
    const document = await this.documentRepository.findOne({ fileKey });
    if (!document) {
      throw new Error('Document not found');
    }
    const file = await this.r2Adapter.getPresignedUrl(fileKey);
    return file;
  }

  async getDocumentsByUserId(
    userId: string,
  ): Promise<any> {
    const documents = await this.documentRepository.find({
      userId: userId,
    });
    if (!documents) {
      throw new Error('Document not found');
    }
    return documents;
  }
  
  async deleteDocument(
    documentId: string,
    userId: string,
  ): Promise<{message: string}> {
    const document = await this.documentRepository.findOne({
      _id: new Types.ObjectId(documentId),
      userId: userId,
    });
    if (!document) {
     return { message: 'Document not found or you do not have permission to delete it' };
    }
    await this.r2Adapter.delete(document.fileKey);
   
    await this.documentRepository.findOneAndDelete({ _id: new Types.ObjectId(documentId) });

    return { message: 'Document deleted successfully' };
  }
}
