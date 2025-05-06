export class GetDocumentDto {
  fileId: string;
  title?: string;
  userId: string;
  fileKey: string;
  sha256: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELED';
  signers?: string[];
  auditTrailId?: string;
   metadata?: Map<string, string>;
}
