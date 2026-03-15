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
import { SubjectService } from './subject.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { ParseObjectIdPipe } from '../common/pipes/parse-object-id.pipe';
import { PaginationDto } from '../common/dto/pagination.dto';
import { FilterSubjectDto } from './dto/filter-subject.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Subjects')
@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  @ApiOperation({ summary: 'List all subjects with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number (default: 1)' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page (default: 20, max: 100)' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Search by name' })
  @ApiResponse({ status: 200, description: 'Paginated list of subjects' })
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterSubjectDto,
  ) {
    return this.subjectService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a subject by ID' })
  @ApiParam({ name: 'id', description: 'Subject ObjectId' })
  @ApiResponse({ status: 200, description: 'Subject found' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const subject = await this.subjectService.findOne(id);
    return { data: subject };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new subject' })
  @ApiBody({ type: CreateSubjectDto })
  @ApiResponse({ status: 201, description: 'Subject created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  async create(@Body() dto: CreateSubjectDto) {
    const subject = await this.subjectService.create(dto);
    return { data: subject };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a subject' })
  @ApiParam({ name: 'id', description: 'Subject ObjectId' })
  @ApiBody({ type: UpdateSubjectDto })
  @ApiResponse({ status: 200, description: 'Subject updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, dto);
    return { data: subject };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a subject' })
  @ApiParam({ name: 'id', description: 'Subject ObjectId' })
  @ApiResponse({ status: 204, description: 'Subject deleted successfully' })
  @ApiResponse({ status: 404, description: 'Subject not found' })
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.subjectService.remove(id);
  }
}
