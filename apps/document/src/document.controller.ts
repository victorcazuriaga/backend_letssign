import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard, RmqService } from '@app/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import { Types } from 'mongoose';
import { UpdateSignersDto } from './dtos/update.signers.dto';
import { GetDocumentDto } from './dtos/get-document.dto';

@Controller('document')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly rmqService: RmqService,
  ) {}

  @Post('')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: { user: { _id: Types.ObjectId }, title: string },
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ documentId: Types.ObjectId }> {
    const userId = req.user._id;
    const documentId = await this.documentService.uploadDocument(file, userId);
    return { documentId };
  }

  @Get('')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByUserId(@Req() req: { user: { _id: string } }): Promise<GetDocumentDto[]> {
    const userId = req.user._id;
    return await this.documentService.getDocumentsByUserId(userId);
  }
  
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteDocument(@Req() req: { user: { _id: string} }, @Param('id') documentId: string): Promise<{message: string}> {
    const userId = req.user._id;
    return await this.documentService.deleteDocument(documentId, userId);
  }
  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateDocument(
    @Req() req: { user: { _id: string} },
    @Param('id') documentId: string,
    @Body() updatedData: Partial<{ [key: string]: string }>,
  ): Promise<any> {
    const userId = req.user._id;
    return await this.documentService.updateDetailsDocument(
      documentId,
      userId,
      updatedData,
    );
  }

 @MessagePattern('get.document.url')
  async getDocumentUrlFromQueue(@Payload() data: {fileKey:string}): Promise<string> {
    const fileKey = data.fileKey;
    return await this.documentService.getDocumentUrl(fileKey);
  }

  @MessagePattern('update.document')
  async updateDocumentFromQueue(
    @Payload()
    data: UpdateSignersDto,
    @Ctx() context: RmqContext,
  ): Promise<any> {
    await this.documentService.updateSignersDocument(
      data.signers,
      data.documentId,
    );
    this.rmqService.ack(context);
    return { message: 'Document updated successfully' };
  }
}
