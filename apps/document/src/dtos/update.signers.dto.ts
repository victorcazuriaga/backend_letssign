import { Types } from "mongoose";

export class UpdateSignersDto {
  documentId: string; 
  signers:  string[];
}
