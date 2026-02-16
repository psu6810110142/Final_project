import { Test, TestingModule } from '@nestjs/testing';
import { LearningProgressController } from './learning_progress.controller';
import { LearningProgressService } from './learning_progress.service';

describe('LearningProgressController', () => {
  let controller: LearningProgressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LearningProgressController],
      providers: [LearningProgressService],
    }).compile();

    controller = module.get<LearningProgressController>(LearningProgressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
