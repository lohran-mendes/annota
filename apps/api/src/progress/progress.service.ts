import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserAnswer, UserAnswerDocument } from '../answer/answer.schema';
import { Subject, SubjectDocument } from '../subject/subject.schema';
import { Topic, TopicDocument } from '../topic/topic.schema';
import { Exam, ExamDocument } from '../exam/exam.schema';
import { Question, QuestionDocument } from '../question/question.schema';
import type { UserProgress, ExamProgress } from '@annota/shared';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(UserAnswer.name)
    private userAnswerModel: Model<UserAnswerDocument>,
    @InjectModel(Subject.name)
    private subjectModel: Model<SubjectDocument>,
    @InjectModel(Topic.name)
    private topicModel: Model<TopicDocument>,
    @InjectModel(Exam.name)
    private examModel: Model<ExamDocument>,
    @InjectModel(Question.name)
    private questionModel: Model<QuestionDocument>,
  ) {}

  async getGlobalProgress(): Promise<UserProgress> {
    const totalAnswered = await this.userAnswerModel.countDocuments().exec();
    const totalCorrect = await this.userAnswerModel
      .countDocuments({ correct: true })
      .exec();

    // Calcular streak
    const recentAnswers = await this.userAnswerModel
      .find()
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    let streak = 0;
    for (const answer of recentAnswers) {
      if (answer.correct) {
        streak++;
      } else {
        break;
      }
    }

    // Progresso por materia
    const bySubjectAgg = await this.userAnswerModel.aggregate([
      {
        $group: {
          _id: '$subjectId',
          answered: { $sum: 1 },
          correct: { $sum: { $cond: ['$correct', 1, 0] } },
        },
      },
    ]);

    const subjects = await this.subjectModel.find().exec();
    const subjectMap = new Map(
      subjects.map((s) => [s._id.toString(), s]),
    );

    const bySubject = bySubjectAgg.map((agg) => {
      const subject = subjectMap.get(agg._id.toString());
      return {
        subjectId: agg._id.toString(),
        subjectName: subject?.name ?? 'Desconhecida',
        answered: agg.answered,
        correct: agg.correct,
        color: subject?.color ?? '#999',
      };
    });

    return { totalAnswered, totalCorrect, streak, bySubject };
  }

  async getExamProgress(examId: string): Promise<ExamProgress> {
    // Buscar exam para validar e obter subjects derivados
    const exam = await this.examModel.findById(examId).exec();
    if (!exam) {
      throw new NotFoundException(`Exam with id ${examId} not found`);
    }

    const filter = { examId };
    const totalAnswered = await this.userAnswerModel
      .countDocuments(filter)
      .exec();
    const totalCorrect = await this.userAnswerModel
      .countDocuments({ ...filter, correct: true })
      .exec();

    // Streak considerando apenas respostas deste exam
    const recentAnswers = await this.userAnswerModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(100)
      .exec();

    let streak = 0;
    for (const answer of recentAnswers) {
      if (answer.correct) {
        streak++;
      } else {
        break;
      }
    }

    // Derivar subjects do exam via questionIds
    const subjectIds = await this.questionModel
      .distinct('subjectId', { _id: { $in: exam.questionIds } })
      .exec();

    const subjects = await this.subjectModel
      .find({ _id: { $in: subjectIds } })
      .exec();
    const subjectMap = new Map(
      subjects.map((s) => [s._id.toString(), s]),
    );

    // Por materia
    const bySubjectAgg = await this.userAnswerModel.aggregate([
      { $match: { examId: { $eq: examId } } },
      {
        $group: {
          _id: '$subjectId',
          answered: { $sum: 1 },
          correct: { $sum: { $cond: ['$correct', 1, 0] } },
        },
      },
    ]);

    const bySubject = bySubjectAgg.map((agg) => {
      const subject = subjectMap.get(agg._id.toString());
      return {
        subjectId: agg._id.toString(),
        subjectName: subject?.name ?? 'Desconhecida',
        answered: agg.answered,
        correct: agg.correct,
        color: subject?.color ?? '#999',
      };
    });

    // Por topico
    const byTopicAgg = await this.userAnswerModel.aggregate([
      { $match: { examId: { $eq: examId } } },
      {
        $group: {
          _id: '$topicId',
          subjectId: { $first: '$subjectId' },
          answered: { $sum: 1 },
          correct: { $sum: { $cond: ['$correct', 1, 0] } },
        },
      },
    ]);

    const topics = await this.topicModel.find().exec();
    const topicMap = new Map(
      topics.map((t) => [t._id.toString(), t]),
    );

    const byTopic = byTopicAgg.map((agg) => {
      const topic = topicMap.get(agg._id.toString());
      return {
        topicId: agg._id.toString(),
        topicName: topic?.name ?? 'Desconhecido',
        subjectId: agg.subjectId.toString(),
        answered: agg.answered,
        correct: agg.correct,
      };
    });

    return { examId, totalAnswered, totalCorrect, streak, bySubject, byTopic };
  }
}
