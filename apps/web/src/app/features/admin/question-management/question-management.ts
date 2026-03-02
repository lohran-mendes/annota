import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { QuestionService } from '../../../core/services/question.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { QuestionDialog } from '../dialogs/question-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import { MOCK_QUESTIONS, MOCK_TOPICS, MOCK_SUBJECTS } from '../../../core/mock-data';
import type { Question, Subject, Topic } from '@annota/shared';

interface QuestionRow {
  id: string;
  statement: string;
  fullStatement: string;
  topicName: string;
  subjectName: string;
  alternativeCount: number;
  original: Question;
}

interface TopicGroup {
  topic: Topic;
  questions: QuestionRow[];
}

interface SubjectGroup {
  subject: Subject;
  questionCount: number;
  topics: TopicGroup[];
}

@Component({
  selector: 'annota-question-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule, MatProgressSpinnerModule],
  templateUrl: './question-management.html',
  styleUrl: './question-management.scss',
})
export class QuestionManagement implements OnInit {
  private readonly questionService = inject(QuestionService);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  questions = signal<QuestionRow[]>([]);
  subjects = signal<Subject[]>([]);
  topics = signal<Topic[]>([]);
  loading = signal(false);

  groupedBySubject = computed<SubjectGroup[]>(() => {
    const subjects = this.subjects();
    const topics = this.topics();
    const questions = this.questions();

    return subjects.map((subject) => {
      const subjectTopics = topics.filter((t) => t.subjectId === subject.id);
      const topicGroups: TopicGroup[] = subjectTopics.map((topic) => ({
        topic,
        questions: questions.filter((q) => q.original.topicId === topic.id),
      }));
      const questionCount = topicGroups.reduce((sum, tg) => sum + tg.questions.length, 0);

      return { subject, questionCount, topics: topicGroups };
    });
  });

  orphanQuestions = computed<QuestionRow[]>(() => {
    const subjectIds = new Set(this.subjects().map((s) => s.id));
    return this.questions().filter((q) => !subjectIds.has(q.original.subjectId));
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);

    forkJoin({
      subjects: this.subjectService.getAll(),
      topics: this.topicService.getAll(),
      questions: this.questionService.getAll(),
    }).subscribe({
      next: ({ subjects, topics, questions }) => {
        this.subjects.set(subjects.data.length ? subjects.data : MOCK_SUBJECTS);
        this.topics.set(topics.data.length ? topics.data : MOCK_TOPICS);
        this.mapQuestions(questions.data.length ? questions.data : MOCK_QUESTIONS);
        this.loading.set(false);
      },
      error: () => {
        this.subjects.set(MOCK_SUBJECTS);
        this.topics.set(MOCK_TOPICS);
        this.mapQuestions(MOCK_QUESTIONS);
        this.loading.set(false);
      },
    });
  }

  private mapQuestions(questions: Question[]) {
    this.questions.set(
      questions.map((q) => {
        const topic = [...this.topics(), ...MOCK_TOPICS].find((t) => t.id === q.topicId);
        const subject = [...this.subjects(), ...MOCK_SUBJECTS].find((s) => s.id === q.subjectId);
        return {
          id: q.id,
          statement: q.statement.length > 100 ? q.statement.substring(0, 100) + '...' : q.statement,
          fullStatement: q.statement,
          topicName: topic?.name ?? '—',
          subjectName: subject?.name ?? '—',
          alternativeCount: q.alternatives.length,
          original: q,
        };
      }),
    );
  }

  openCreateDialog() {
    const ref = this.dialog.open(QuestionDialog, {
      data: { subjects: this.subjects(), topics: this.topics() },
      maxHeight: '90vh',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.questionService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Questão criada com sucesso!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao criar questão.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(row: QuestionRow) {
    const ref = this.dialog.open(QuestionDialog, {
      data: { question: row.original, subjects: this.subjects(), topics: this.topics() },
      maxHeight: '90vh',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.questionService.update(row.id, result).subscribe({
          next: () => {
            this.snackBar.open('Questão atualizada!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao atualizar questão.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  confirmDelete(row: QuestionRow) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Excluir Questão', message: 'Deseja excluir esta questão? Esta ação não pode ser desfeita.' },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.questionService.delete(row.id).subscribe({
          next: () => {
            this.snackBar.open('Questão excluída!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao excluir questão.', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
