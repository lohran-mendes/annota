import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async findAll(): Promise<Subject[]> {
    return this.subjectModel.find().exec();
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
    return subject.save();
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
    const result = await this.subjectModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Subject with id ${id} not found`);
    }
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
