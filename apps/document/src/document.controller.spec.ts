import { Test, TestingModule } from '@nestjs/testing';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

describe('DocumentController', () => {
  let documentController: DocumentController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [DocumentService],
    }).compile();

    documentController = app.get<DocumentController>(DocumentController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(documentController.getHello()).toBe('Hello World!');
    });
  });
});
