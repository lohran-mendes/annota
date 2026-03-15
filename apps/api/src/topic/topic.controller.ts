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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Topics')
@Controller()
export class TopicController {
  constructor(private readonly topicService: TopicService) {}

  @Get('topics')
  @ApiOperation({ summary: 'List all topics with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiQuery({ name: 'subjectId', required: false, type: String, description: 'Filter by subject ObjectId' })
  @ApiResponse({ status: 200, description: 'Paginated list of topics' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterTopicDto,
  ) {
    return this.topicService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get('subjects/:subjectId/topics')
  @ApiOperation({ summary: 'Get all topics for a subject' })
  @ApiParam({ name: 'subjectId', description: 'Subject ObjectId' })
  @ApiResponse({ status: 200, description: 'List of topics for the subject' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findBySubject(@Param('subjectId', ParseObjectIdPipe) subjectId: string) {
    const topics = await this.topicService.findBySubject(subjectId);
    return { data: topics, total: topics.length };
  }

  @Get('topics/:id')
  @ApiOperation({ summary: 'Get a topic by ID' })
  @ApiParam({ name: 'id', description: 'Topic ObjectId' })
  @ApiResponse({ status: 200, description: 'Topic found' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const topic = await this.topicService.findOne(id);
    return { data: topic };
  }

  @Post('topics')
  @ApiOperation({ summary: 'Create a new topic' })
  @ApiBody({ type: CreateTopicDto })
  @ApiResponse({ status: 201, description: 'Topic created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateTopicDto) {
    const topic = await this.topicService.create(dto);
    return { data: topic };
  }

  @Put('topics/:id')
  @ApiOperation({ summary: 'Update a topic' })
  @ApiParam({ name: 'id', description: 'Topic ObjectId' })
  @ApiBody({ type: UpdateTopicDto })
  @ApiResponse({ status: 200, description: 'Topic updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateTopicDto,
  ) {
    const topic = await this.topicService.update(id, dto);
    return { data: topic };
  }

  @Delete('topics/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a topic' })
  @ApiParam({ name: 'id', description: 'Topic ObjectId' })
  @ApiResponse({ status: 204, description: 'Topic deleted successfully' })
  @ApiResponse({ status: 404, description: 'Topic not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.topicService.remove(id);
  }
}
