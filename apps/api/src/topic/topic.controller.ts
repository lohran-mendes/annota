import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterTopicDto } from './dto/filter-topic.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Topics')
@Controller()
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('topics')
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterTopicDto,
  ) {
    return this.topicService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get('subjects/:subjectId/topics')
  async findBySubject(@Param('subjectId', ParseObjectIdPipe) subjectId: string) {
    const topics = await this.topicService.findBySubject(subjectId);
    return { data: topics, total: topics.length };
  }

  @Get('topics/:id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const topic = await this.topicService.findOne(id);
    return { data: topic };
  }

  @Post('topics')
  async create(@Body() dto: CreateTopicDto) {
    const topic = await this.topicService.create(dto);
    return { data: topic };
  }

  @Put('topics/:id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTopicDto,
  ) {
    const topic = await this.topicService.update(id, dto);
    return { data: topic };
  }

  @Delete('topics/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.topicService.remove(id);
  }
}
