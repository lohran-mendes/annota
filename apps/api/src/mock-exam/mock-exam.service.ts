import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MockExam, MockExamDocument } from './mock-exam.schema';
import {
  MockExamResult,
  MockExamResultDocument,
} from './mock-exam-result.schema';
import { Question, QuestionDocument } from '../question/question.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { CreateMockExamDto } from './dto/create-mock-exam.dto';
import { SubmitMockExamDto } from './dto/submit-mock-exam.dto';
import type {
  MockExamSession,
  MockExamResult as IMockExamResult,
} from '@annota/shared';

@Injectable()
export class MockExamService {
  constructor(
    @InjectModel(MockExam.name)
    private mockExamModel: Model<MockExamDocument>,
    @InjectModel(MockExamResult.name)
    private mockExamResultModel: Model<MockExamResultDocument>,
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
  ) {}

  async findByExam(examId: string) {
    return this.mockExamModel.find({ examId }).exec();
  }

  async create(dto: CreateMockExamDto): Promise<MockExamSession> {
    // Buscar subjects do exam para encontrar questoes
    const subjects = await this.subjectModel
      .find({ examId: dto.examId })
      .exec();
    const subjectIds = subjects.map((s) => s._id);

    // Buscar todas as questoes do exam
    const allQuestions = await this.questionModel
      .find({ subjectId: { $in: subjectIds } })
      .exec();

    // Selecionar questoes aleatorias
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(
      0,
      Math.min(dto.questionCount, shuffled.length),
    );

    // Criar mock exam
    const mockExam = new this.mockExamModel({
      ...dto,
      questionIds: selected.map((q) => q._id),
      status: 'in_progress',
    });
    const saved = await mockExam.save();

    // Retornar session sem gabarito
    const questions = selected.map((q) => ({
      id: q._id.toString(),
      topicId: q.topicId.toString(),
      subjectId: q.subjectId.toString(),
      statement: q.statement,
      alternatives: q.alternatives,
    }));

    return {
      config: saved.toJSON() as any,
      questions,
    };
  }

  async getSession(id: string): Promise<MockExamSession> {
    const mockExam = await this.mockExamModel.findById(id).exec();
    if (!mockExam) {
      throw new NotFoundException(`MockExam with id ${id} not found`);
    }

    // Buscar questoes SEM gabarito
    const questions = await this.questionModel
      .find({ _id: { $in: mockExam.questionIds } })
      .exec();

    const sanitizedQuestions = questions.map((q) => ({
      id: q._id.toString(),
      topicId: q.topicId.toString(),
      subjectId: q.subjectId.toString(),
      statement: q.statement,
      alternatives: q.alternatives,
    }));

    return {
      config: mockExam.toJSON() as any,
      questions: sanitizedQuestions,
    };
  }

  async submit(
    id: string,
    dto: SubmitMockExamDto,
  ): Promise<IMockExamResult> {
    const mockExam = await this.mockExamModel.findById(id).exec();
    if (!mockExam) {
      throw new NotFoundException(`MockExam with id ${id} not found`);
    }

    // Buscar questoes com gabarito
    const questions = await this.questionModel
      .find({ _id: { $in: mockExam.questionIds } })
      .exec();

    const questionMap = new Map(
      questions.map((q) => [q._id.toString(), q]),
    );

    // Buscar subjects para nomes e cores
    const subjectIds = [...new Set(questions.map((q) => q.subjectId.toString()))];
    const subjects = await this.subjectModel
      .find({ _id: { $in: subjectIds } })
      .exec();
    const subjectMap = new Map(
      subjects.map((s) => [s._id.toString(), s]),
    );

    // Corrigir respostas
    let correctCount = 0;
    const details = dto.answers.map((answer) => {
      const question = questionMap.get(answer.questionId);
      const correct =
        question !== undefined &&
        answer.selectedIndex === question.correctAnswerIndex;
      if (correct) correctCount++;

      return {
        questionId: answer.questionId,
        statement: question?.statement ?? '',
        alternatives: question?.alternatives ?? [],
        selectedIndex: answer.selectedIndex,
        correctAnswerIndex: question?.correctAnswerIndex ?? 0,
        correct,
        explanation: question?.explanation ?? '',
      };
    });

    const score = Math.round(
      (correctCount / mockExam.questionCount) * 100,
    );

    // Calcular resultado por materia
    const subjectStats = new Map<
      string,
      { total: number; correct: number }
    >();

    for (const detail of details) {
      const question = questionMap.get(detail.questionId);
      if (!question) continue;
      const sid = question.subjectId.toString();
      const stats = subjectStats.get(sid) || { total: 0, correct: 0 };
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

    // Atualizar status do mock exam
    await this.mockExamModel
      .findByIdAndUpdate(id, {
        status: 'completed',
        score,
        completedAt: new Date(),
      })
      .exec();

    // Salvar resultado detalhado
    const result = new this.mockExamResultModel({
      mockExamId: id,
      score,
      totalQuestions: mockExam.questionCount,
      correctCount,
      timeSpent: dto.timeSpent,
      bySubject,
      details,
    });
    await result.save();

    return {
      mockExamId: id,
      score,
      totalQuestions: mockExam.questionCount,
      correctCount,
      timeSpent: dto.timeSpent,
      bySubject,
      details,
    };
  }

  async getResult(id: string): Promise<IMockExamResult> {
    const result = await this.mockExamResultModel
      .findOne({ mockExamId: id })
      .exec();
    if (!result) {
      throw new NotFoundException(
        `Result for MockExam with id ${id} not found`,
      );
    }
    return result.toJSON() as any;
  }
}
