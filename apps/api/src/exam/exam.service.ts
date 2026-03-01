import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './exam.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
  ) {}

  async findAll(): Promise<Exam[]> {
    return this.examModel.find().exec();
  }

  async findOne(id: string): Promise<Exam> {
    const exam = await this.examModel.findById(id).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
    return exam;
  }

  async create(dto: CreateExamDto): Promise<Exam> {
    const exam = new this.examModel(dto);
    return exam.save();
  }

  async update(id: string, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.examModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
    return exam;
  }

  async remove(id: string): Promise<void> {
    const result = await this.examModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
  }

  async incrementSubjectCount(id: string, delta: number): Promise<void> {
    await this.examModel
      .findByIdAndUpdate(id, { $inc: { subjectCount: delta } })
      .exec();
  }

  async incrementQuestionCount(id: string, delta: number): Promise<void> {
    await this.examModel
      .findByIdAndUpdate(id, { $inc: { questionCount: delta } })
      .exec();
  }
}
