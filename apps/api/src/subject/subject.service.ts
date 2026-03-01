import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ExamService } from '../exam/exam.service';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    private readonly examService: ExamService,
  ) {}

  async findByExam(examId: string): Promise<Subject[]> {
    return this.subjectModel.find({ examId }).exec();
  }

  async findOne(id: string): Promise<Subject> {
    const subject = await this.subjectModel.findById(id).exec();
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    return subject;
  }

  async create(dto: CreateSubjectDto): Promise<Subject> {
    const subject = new this.subjectModel(dto);
    const saved = await subject.save();
    await this.examService.incrementSubjectCount(dto.examId, 1);
    return saved;
  }

  async update(id: string, dto: UpdateSubjectDto): Promise<Subject> {
    const subject = await this.subjectModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    return subject;
  }

  async remove(id: string): Promise<void> {
    const subject = await this.subjectModel.findById(id).exec();
    if (!subject) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
    await this.subjectModel.findByIdAndDelete(id).exec();
    await this.examService.incrementSubjectCount(
      subject.examId.toString(),
      -1,
    );
  }

  async incrementQuestionCount(id: string, delta: number): Promise<void> {
    await this.subjectModel
      .findByIdAndUpdate(id, { $inc: { questionCount: delta } })
      .exec();
  }

  async incrementCompletedCount(id: string, delta: number): Promise<void> {
    await this.subjectModel
      .findByIdAndUpdate(id, { $inc: { completedCount: delta } })
      .exec();
  }
}
