import { Injectable } from '@nestjs/common';
import { CreateLearningProgressDto } from './dto/create-learning_progress.dto';
import { UpdateLearningProgressDto } from './dto/update-learning_progress.dto';

@Injectable()
export class LearningProgressService {
  create(createLearningProgressDto: CreateLearningProgressDto) {
    return 'This action adds a new learningProgress';
  }

  findAll() {
    return `This action returns all learningProgress`;
  }

  findOne(id: number) {
    return `This action returns a #${id} learningProgress`;
  }

  update(id: number, updateLearningProgressDto: UpdateLearningProgressDto) {
    return `This action updates a #${id} learningProgress`;
  }

  remove(id: number) {
    return `This action removes a #${id} learningProgress`;
  }
}
