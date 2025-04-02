import { Injectable } from '@nestjs/common';

@Injectable()
export class DocumentService {
  getHello(): string {
    return 'Hello World!';
  }
}
