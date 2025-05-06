import { Types } from "mongoose";

export class CreateDocumentDto {
  userId: Types.ObjectId
  title: string;
  file: Express.Multer.File;
}
