import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Exam, ExamDocument } from './exam.schema';
import { Question, QuestionDocument } from '../question/question.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { Topic, TopicDocument } from '../topic/topic.schema';
import { CreateExamDto } from './dto/create-exam.dto';
import { UpdateExamDto } from './dto/update-exam.dto';
import { FilterExamDto } from './dto/filter-exam.dto';
import type { ExamSubject, ExamTopic } from '@annota/shared';
import { paginate, normalizeLeanDoc, normalizeLeanDocs, PaginatedResult } from '../common/utils/paginate';

@Injectable()
export class ExamService {
  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(Question.name) private questionModel: Model<QuestionDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}

  async findAll(
    page = 1,
    limit = 20,
    filter?: FilterExamDto,
  ): Promise<PaginatedResult<Exam>> {
    const query: Record<string, unknown> = {};
    if (filter?.search) {
      const regex = new RegExp(filter.search, 'i');
      query.$or = [{ name: regex }, { institution: regex }];
    }
    if (filter?.year) query.year = filter.year;
    if (filter?.institution)
      query.institution = new RegExp(filter.institution, 'i');
    return paginate(this.examModel, query, page, limit);
  }

  async findOne(id: string): Promise<Exam> {
    const exam = await this.examModel.findById(id).lean().exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
    return normalizeLeanDoc<Exam>(exam);
  }

  async create(dto: CreateExamDto): Promise<Exam> {
    const exam = new this.examModel(dto);
    const saved = await exam.save();
    if (dto.questionIds?.length) {
      await this.recomputeExamCounts(saved._id.toString());
      return this.findOne(saved._id.toString());
    }
    return saved;
  }

  async update(id: string, dto: UpdateExamDto): Promise<Exam> {
    const exam = await this.examModel
      .findByIdAndUpdate(id, dto, { returnDocument: 'after' })
      .exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
    if (dto.questionIds !== undefined) {
      await this.recomputeExamCounts(id);
      return this.findOne(id);
    }
    return exam;
  }

  async remove(id: string): Promise<void> {
    const result = await this.examModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Exam with id ${id} not found`);
    }
  }

  async linkQuestions(examId: string, questionIds: string[]): Promise<Exam> {
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    // Validar que todas as questoes existem
    const count = await this.questionModel
      .countDocuments({ _id: { $in: questionIds } })
      .exec();
    if (count !== questionIds.length) {
      throw new NotFoundException('One or more question IDs are invalid');
    }

    await this.examModel
      .findByIdAndUpdate(examId, {
        $addToSet: { questionIds: { $each: questionIds } },
      })
      .exec();

    await this.recomputeExamCounts(examId);
    return this.findOne(examId);
  }

  async unlinkQuestions(examId: string, questionIds: string[]): Promise<Exam> {
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    await this.examModel
      .findByIdAndUpdate(examId, {
        $pull: { questionIds: { $in: questionIds } },
      })
      .exec();

    await this.recomputeExamCounts(examId);
    return this.findOne(examId);
  }

  async getExamQuestions(examId: string): Promise<Question[]> {
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }
    const questions = await this.questionModel
      .find({ _id: { $in: exam.questionIds } })
      .lean()
      .exec();
    return normalizeLeanDocs<Question>(questions);
  }

  async getExamSubjects(examId: string): Promise<ExamSubject[]> {
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    if (!exam.questionIds.length) {
      return [];
    }

    const questions = await this.questionModel
      .find({ _id: { $in: exam.questionIds } })
      .lean()
      .exec();

    // Agrupar questoes por subjectId
    const subjectQuestionsMap = new Map<string, typeof questions>();
    for (const q of questions) {
      const sid = q.subjectId.toString();
      if (!subjectQuestionsMap.has(sid)) {
        subjectQuestionsMap.set(sid, []);
      }
      subjectQuestionsMap.get(sid)!.push(q);
    }

    // Buscar subjects e topics
    const subjectIds = [...subjectQuestionsMap.keys()];
    const subjects = await this.subjectModel
      .find({ _id: { $in: subjectIds } })
      .lean()
      .exec();
    const subjectMap = new Map(
      subjects.map((s) => [s._id.toString(), s]),
    );

    const topicIds = [...new Set(questions.map((q) => q.topicId.toString()))];
    const topics = await this.topicModel
      .find({ _id: { $in: topicIds } })
      .lean()
      .exec();
    const topicMap = new Map(topics.map((t) => [t._id.toString(), t]));

    // Montar ExamSubject[]
    const result: ExamSubject[] = [];
    for (const [sid, subjectQuestions] of subjectQuestionsMap) {
      const subject = subjectMap.get(sid);
      if (!subject) continue;

      // Agrupar por topicId dentro do subject
      const topicQuestionsMap = new Map<string, number>();
      for (const q of subjectQuestions) {
        const tid = q.topicId.toString();
        topicQuestionsMap.set(tid, (topicQuestionsMap.get(tid) ?? 0) + 1);
      }

      const examTopics: ExamTopic[] = [];
      for (const [tid, count] of topicQuestionsMap) {
        const topic = topicMap.get(tid);
        examTopics.push({
          id: tid,
          name: topic?.name ?? 'Desconhecido',
          questionCount: count,
        });
      }

      result.push({
        id: sid,
        name: subject.name,
        icon: subject.icon,
        color: subject.color,
        questionCount: subjectQuestions.length,
        topics: examTopics,
      });
    }

    return result;
  }

  async removeQuestionFromAllExams(questionId: string): Promise<void> {
    const affectedExams = await this.examModel
      .find({ questionIds: questionId })
      .exec();

    if (!affectedExams.length) return;

    await this.examModel
      .updateMany(
        { questionIds: questionId },
        { $pull: { questionIds: questionId } },
      )
      .exec();

    for (const exam of affectedExams) {
      await this.recomputeExamCounts(exam._id.toString());
    }
  }

  private async recomputeExamCounts(examId: string): Promise<void> {
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) return;

    const questionCount = exam.questionIds.length;

    const subjectIds = await this.questionModel
      .distinct('subjectId', { _id: { $in: exam.questionIds } })
      .exec();

    await this.examModel
      .findByIdAndUpdate(examId, {
        questionCount,
        subjectCount: subjectIds.length,
      })
      .exec();
  }
}
