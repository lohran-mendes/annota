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

@Controller('subjects')
export class SubjectController {
  constructor(private readonly subjectService: SubjectService) {}

  @Get()
  async findAll(
    @Query() pagination: PaginationDto,
    @Query() filter: FilterSubjectDto,
  ) {
    return this.subjectService.findAll(pagination.page, pagination.limit, filter);
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: string) {
    const subject = await this.subjectService.findOne(id);
    return { data: subject };
  }

  @Post()
  async create(@Body() dto: CreateSubjectDto) {
    const subject = await this.subjectService.create(dto);
    return { data: subject };
  }

  @Put(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateSubjectDto,
  ) {
    const subject = await this.subjectService.update(id, dto);
    return { data: subject };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseObjectIdPipe) id: string): Promise<void> {
    await this.subjectService.remove(id);
  }
}
