import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subject, SubjectDocument } from './subject.schema';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { FilterSubjectDto } from './dto/filter-subject.dto';
import { paginate, PaginatedResult } from '../common/utils/paginate';

@Injectable()
export class SubjectService {
  constructor(
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    filter?: FilterSubjectDto,
  ): Promise<PaginatedResult<Subject>> {
    const query: Record<string, unknown> = {};
    if (filter?.search) query.name = new RegExp(filter.search, 'i');
    return paginate(this.subjectModel, query, page, limit);
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
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
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

}
