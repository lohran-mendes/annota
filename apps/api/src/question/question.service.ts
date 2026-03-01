import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { TopicService } from '../topic/topic.service';
import { SubjectService } from '../subject/subject.service';
import { ExamService } from '../exam/exam.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    private readonly topicService: TopicService,
    private readonly subjectService: SubjectService,
    private readonly examService: ExamService,
  ) {}

  async findByTopic(topicId: string): Promise<Question[]> {
    return this.questionModel.find({ topicId }).exec();
  }

  async findBySubject(subjectId: string): Promise<Question[]> {
    return this.questionModel.find({ subjectId }).exec();
  }

  async findOne(id: string): Promise<Question> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return question;
  }

  async create(dto: CreateQuestionDto): Promise<Question> {
    const question = new this.questionModel(dto);
    const saved = await question.save();

    // Atualizar contadores
    await this.topicService.incrementQuestionCount(dto.topicId, 1);
    await this.subjectService.incrementQuestionCount(dto.subjectId, 1);

    const subject = await this.subjectService.findOne(dto.subjectId);
    await this.examService.incrementQuestionCount(
      (subject as any).examId,
      1,
    );

    return saved;
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
    const question = await this.questionModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return question;
  }

  async remove(id: string): Promise<void> {
    const question = await this.questionModel.findById(id).exec();
    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }

    await this.questionModel.findByIdAndDelete(id).exec();

    // Decrementar contadores
    await this.topicService.incrementQuestionCount(
      question.topicId.toString(),
      -1,
    );
    await this.subjectService.incrementQuestionCount(
      question.subjectId.toString(),
      -1,
    );

    const subject = await this.subjectService.findOne(
      question.subjectId.toString(),
    );
    await this.examService.incrementQuestionCount(
      (subject as any).examId,
      -1,
    );
  }
}
