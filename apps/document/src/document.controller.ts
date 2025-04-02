import { Controller, Get } from '@nestjs/common';
import { DocumentService } from './document.service';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get()
  getHello(): string {
    return this.documentService.getHello();
  }
}
