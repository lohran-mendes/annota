import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MockExam, MockExamDocument } from './mock-exam.schema';
import {
  MockExamSession,
  MockExamSessionDocument,
} from './mock-exam-session.schema';
import {
  MockExamResult,
  MockExamResultDocument,
} from './mock-exam-result.schema';
import { Question, QuestionDocument } from '../question/question.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { Exam, ExamDocument } from '../exam/exam.schema';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { UpdateMockExamDto } from './dto/update-mock-exam.dto';
import { StartSessionDto } from './dto/start-session.dto';
import { SubmitMockExamDto } from './dto/submit-mock-exam.dto';
import type {
  MockExam as IMockExam,
  MockExamSessionData,
  MockExamResult as IMockExamResult,
  MockExamSessionConfig,
} from '@annota/shared';
import { normalizeLeanDoc, normalizeLeanDocs } from '../common/utils/paginate';

@Injectable()
export class MockExamService {
  constructor(
    @InjectModel(MockExam.name)
    private mockExamModel: Model<MockExamDocument>,
    @InjectModel(MockExamSession.name)
    private sessionModel: Model<MockExamSessionDocument>,
    @InjectModel(MockExamResult.name)
    private resultModel: Model<MockExamResultDocument>,
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(Exam.name)
    private examModel: Model<ExamDocument>,
  ) {}

  // ----------------------------------------------------------------
  // Admin CRUD — MockExam templates
  // ----------------------------------------------------------------

  async findAll(examId?: string, published?: boolean): Promise<IMockExam[]> {
    const filter: Record<string, unknown> = {};
    if (examId) filter.examId = examId;
    if (published !== undefined) filter.published = published;
    const docs = await this.mockExamModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((doc) => {
      const norm = normalizeLeanDoc<any>(doc);
      norm.examId = doc.examId?.toString();
      norm.questionCount = Array.isArray(doc.questionIds)
        ? doc.questionIds.length
        : 0;
      norm.questionIds = Array.isArray(doc.questionIds)
        ? doc.questionIds.map((id: any) => id.toString())
        : [];
      return norm as IMockExam;
    });
  }

  async findOne(id: string): Promise<IMockExam> {
    const doc = await this.mockExamModel.findById(id).lean().exec();
    if (!doc) {
      throw new NotFoundException(`MockExam with id ${id} not found`);
    }
    const norm = normalizeLeanDoc<any>(doc);
    norm.examId = doc.examId?.toString();
    norm.questionCount = Array.isArray(doc.questionIds)
      ? doc.questionIds.length
      : 0;
    norm.questionIds = Array.isArray(doc.questionIds)
      ? doc.questionIds.map((id: any) => id.toString())
      : [];
    return norm as IMockExam;
  }

  async create(dto: CreateMockExamDto): Promise<IMockExam> {
    // Validar que o exam existe
    const exam = await this.examModel.findById(dto.examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${dto.examId} not found`);
    }

    // Validar que todas as questoes existem
    const count = await this.questionModel
      .countDocuments({ _id: { $in: dto.questionIds } })
      .exec();
    if (count !== dto.questionIds.length) {
      throw new BadRequestException('One or more questionIds are invalid');
    }

    const mockExam = new this.mockExamModel(dto);
    const saved = await mockExam.save();
    return this.findOne(saved._id.toString());
  }

  async update(id: string, dto: UpdateMockExamDto): Promise<IMockExam> {
    // Validar questionIds se fornecidos
    if (dto.questionIds !== undefined) {
      const count = await this.questionModel
        .countDocuments({ _id: { $in: dto.questionIds } })
        .exec();
      if (count !== dto.questionIds.length) {
        throw new BadRequestException('One or more questionIds are invalid');
      }
    }

    const updated = await this.mockExamModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`MockExam with id ${id} not found`);
    }
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.mockExamModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`MockExam with id ${id} not found`);
    }
  }

  // ----------------------------------------------------------------
  // Student sessions — MockExamSession
  // ----------------------------------------------------------------

  async startSession(dto: StartSessionDto): Promise<MockExamSessionData> {
    const mockExam = await this.mockExamModel
      .findById(dto.mockExamId)
      .exec();
    if (!mockExam) {
      throw new NotFoundException(
        `MockExam with id ${dto.mockExamId} not found`,
      );
    }
    if (!mockExam.published) {
      throw new BadRequestException(
        `MockExam with id ${dto.mockExamId} is not published`,
      );
    }

    // Criar session copiando os questionIds do template
    const session = new this.sessionModel({
      mockExamId: mockExam._id,
      mockExamName: mockExam.name,
      questionCount: mockExam.questionIds.length,
      duration: mockExam.duration,
      questionIds: mockExam.questionIds,
      status: 'in_progress',
    });
    const savedSession = await session.save();

    // Buscar questoes SEM gabarito
    const questions = await this.questionModel
      .find({ _id: { $in: mockExam.questionIds } })
      .lean()
      .exec();

    const sanitizedQuestions = questions.map((q) => ({
      id: q._id.toString(),
      topicId: q.topicId.toString(),
      subjectId: q.subjectId.toString(),
      statement: q.statement,
      alternatives: q.alternatives,
    }));

    return {
      config: savedSession.toJSON() as unknown as MockExamSessionConfig,
      questions: sanitizedQuestions,
    };
  }

  async getSession(sessionId: string): Promise<MockExamSessionData> {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException(
        `MockExamSession with id ${sessionId} not found`,
      );
    }

    // Buscar questoes SEM gabarito
    const questions = await this.questionModel
      .find({ _id: { $in: session.questionIds } })
      .lean()
      .exec();

    const sanitizedQuestions = questions.map((q) => ({
      id: q._id.toString(),
      topicId: q.topicId.toString(),
      subjectId: q.subjectId.toString(),
      statement: q.statement,
      alternatives: q.alternatives,
    }));

    return {
      config: session.toJSON() as unknown as MockExamSessionConfig,
      questions: sanitizedQuestions,
    };
  }

  async listSessions(mockExamId?: string): Promise<MockExamSessionConfig[]> {
    const filter: Record<string, unknown> = {};
    if (mockExamId) filter.mockExamId = mockExamId;
    const docs = await this.sessionModel
      .find(filter)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    return docs.map((doc) => {
      const norm = normalizeLeanDoc<any>(doc);
      norm.mockExamId = doc.mockExamId?.toString();
      return norm as MockExamSessionConfig;
    });
  }

  async submitSession(
    sessionId: string,
    dto: SubmitMockExamDto,
  ): Promise<IMockExamResult> {
    const session = await this.sessionModel.findById(sessionId).exec();
    if (!session) {
      throw new NotFoundException(
        `MockExamSession with id ${sessionId} not found`,
      );
    }
    if (session.status === 'completed') {
      throw new BadRequestException(
        `Session ${sessionId} has already been submitted`,
      );
    }

    // Buscar questoes com gabarito
    const questions = await this.questionModel
      .find({ _id: { $in: session.questionIds } })
      .exec();

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q]),
    );

    // Buscar subjects para nomes e cores
    const subjectIds = [
      ...new Set(questions.map((q) => q.subjectId.toString())),
    ];
    const subjects = await this.subjectModel
      .find({ _id: { $in: subjectIds } })
      .exec();
    const subjectMap = new Map(subjects.map((s) => [s._id.toString(), s]));

    // Corrigir respostas
    let correctCount = 0;
    const details = dto.answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      const correct =
        question !== undefined &&
        answer.selectedIndex === question.correctAnswerIndex;
      if (correct) correctCount++;

      const sid = question?.subjectId?.toString() ?? '';
      const subject = subjectMap.get(sid);

      return {
        questionId: answer.questionId,
        subjectId: sid,
        subjectName: subject?.name ?? 'Desconhecida',
        statement: question?.statement ?? '',
        alternatives: question?.alternatives ?? [],
        selectedIndex: answer.selectedIndex,
        correctAnswerIndex: question?.correctAnswerIndex ?? 0,
        correct,
        explanation: question?.explanation ?? '',
      };
    });

    const score = Math.round((correctCount / session.questionCount) * 100);

    // Calcular resultado por materia
    const subjectStats = new Map<string, { total: number; correct: number }>();
    for (const detail of details) {
      const question = questionMap.get(detail.questionId);
      if (!question) continue;
      const sid = question.subjectId.toString();
      const stats = subjectStats.get(sid) ?? { total: 0, correct: 0 };
      stats.total++;
      if (detail.correct) stats.correct++;
      subjectStats.set(sid, stats);
    }

    const bySubject = Array.from(subjectStats.entries()).map(
      ([sid, stats]) => {
        const subject = subjectMap.get(sid);
        return {
          subjectId: sid,
          subjectName: subject?.name ?? 'Desconhecida',
          total: stats.total,
          correct: stats.correct,
          color: subject?.color ?? '#999',
        };
      },
    );

    // Atualizar session para completed
    await this.sessionModel
      .findByIdAndUpdate(sessionId, {
        status: 'completed',
        score,
        completedAt: new Date(),
      })
      .exec();

    // Salvar resultado detalhado
    const result = new this.resultModel({
      sessionId,
      score,
      totalQuestions: session.questionCount,
      correctCount,
      timeSpent: dto.timeSpent,
      bySubject,
      details,
    });
    await result.save();

    return {
      sessionId,
      score,
      totalQuestions: session.questionCount,
      correctCount,
      timeSpent: dto.timeSpent,
      bySubject,
      details,
    };
  }

  async getSessionResult(sessionId: string): Promise<IMockExamResult> {
    const result = await this.resultModel
      .findOne({ sessionId })
      .exec();
    if (!result) {
      throw new NotFoundException(
        `Result for session with id ${sessionId} not found`,
      );
    }
    return result.toJSON() as unknown as IMockExamResult;
  }
}
