import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic, TopicDocument } from './topic.schema';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Injectable()
export class TopicService {
  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async findBySubject(subjectId: string): Promise<Topic[]> {
    return this.topicModel.find({ subjectId }).exec();
  }

  async findOne(id: string): Promise<Topic> {
    const topic = await this.topicModel.findById(id).exec();
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return topic;
  }

  async create(dto: CreateTopicDto): Promise<Topic> {
    const topic = new this.topicModel(dto);
    return topic.save();
  }

  async update(id: string, dto: UpdateTopicDto): Promise<Topic> {
    const topic = await this.topicModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!topic) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
    return topic;
  }

  async remove(id: string): Promise<void> {
    const result = await this.topicModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Topic with id ${id} not found`);
    }
  }

  async incrementQuestionCount(id: string, delta: number): Promise<void> {
    await this.topicModel
      .findByIdAndUpdate(id, { $inc: { questionCount: delta } })
      .exec();
  }

  async incrementCompletedCount(id: string, delta: number): Promise<void> {
    await this.topicModel
      .findByIdAndUpdate(id, { $inc: { completedCount: delta } })
      .exec();
  }
}
