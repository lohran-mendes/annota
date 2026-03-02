import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question, QuestionDocument } from './question.schema';
import { Exam, ExamDocument } from '../exam/exam.schema';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { TopicService } from '../topic/topic.service';
import { SubjectService } from '../subject/subject.service';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel(Exam.name)
    private examModel: Model<ExamDocument>,
    private readonly topicService: TopicService,
    private readonly subjectService: SubjectService,
  ) {}

  async findAll(): Promise<Question[]> {
    return this.questionModel.find().exec();
  }

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

    // Atualizar contadores globais de topic e subject
    await this.topicService.incrementQuestionCount(dto.topicId, 1);
    await this.subjectService.incrementQuestionCount(dto.subjectId, 1);

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

    // Buscar exams afetados ANTES de deletar
    const affectedExams = await this.examModel
      .find({ questionIds: id })
      .exec();

    await this.questionModel.findByIdAndDelete(id).exec();

    // Decrementar contadores globais
    await this.topicService.incrementQuestionCount(
      question.topicId.toString(),
      -1,
    );
    await this.subjectService.incrementQuestionCount(
      question.subjectId.toString(),
      -1,
    );

    // Remover dos exams e recomputar contadores
    if (affectedExams.length) {
      await this.examModel
        .updateMany(
          { questionIds: id },
          { $pull: { questionIds: id } },
        )
        .exec();

      for (const exam of affectedExams) {
        const updated = await this.examModel.findById(exam._id).exec();
        if (updated) {
          const subjectIds = await this.questionModel
            .distinct('subjectId', { _id: { $in: updated.questionIds } })
            .exec();
          await this.examModel
            .findByIdAndUpdate(exam._id, {
              questionCount: updated.questionIds.length,
              subjectCount: subjectIds.length,
            })
            .exec();
        }
      }
    }
  }
}
