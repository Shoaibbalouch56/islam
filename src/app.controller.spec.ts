import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome payload', () => {
      const result = appController.getRoot();
      expect(result.message).toContain('Door-to-Door Islam');
      expect(result.roles).toEqual(['USER', 'STUDENT', 'TEACHER']);
    });
  });
});
