export class UpdateDocumentDto {
  title?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  signers?: string[];
  auditTrailId?: string;
  file?: Express.Multer.File;
}