import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MockExamService } from '../../../core/services/mock-exam.service';
import { ExamService } from '../../../core/services/exam.service';
import { MockExamDialog } from '../dialogs/mock-exam-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import type { Exam, MockExam, MockExamSessionAdmin, MockExamSessionStats } from '@annota/shared';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'annota-mock-exam-management',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSlideToggleModule, MatProgressSpinnerModule,
    MatTooltipModule, MatTabsModule, MatChipsModule, MatSelectModule,
    MatFormFieldModule, FormsModule, DatePipe,
  ],
  templateUrl: './mock-exam-management.html',
  styleUrl: './mock-exam-management.scss',
})
export class MockExamManagement implements OnInit {
  private readonly mockExamService = inject(MockExamService);
  private readonly examService = inject(ExamService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  mockExams = signal<MockExam[]>([]);
  sessions = signal<MockExamSessionAdmin[]>([]);
  stats = signal<MockExamSessionStats | null>(null);
  private examMap = signal<Map<string, Exam>>(new Map());
  loading = signal(false);
  loadingSessions = signal(false);
  displayedColumns = ['name', 'exam', 'questions', 'duration', 'published', 'actions'];
  sessionColumns = ['mockExamName', 'status', 'score', 'timeSpent', 'completedAt', 'actions'];

  // Session filters
  filterMockExamId = signal('');
  filterStatus = signal('');

  ngOnInit() {
    this.loadData();
    this.loadSessions();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      mockExams: this.mockExamService.getAll(),
      exams: this.examService.getAll(),
    }).subscribe({
      next: ({ mockExams, exams }) => {
        this.mockExams.set(mockExams.data);
        this.examMap.set(new Map(exams.data.map((e) => [e.id, e])));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  loadSessions() {
    this.loadingSessions.set(true);
    const params: Record<string, string> = {};
    if (this.filterMockExamId()) params['mockExamId'] = this.filterMockExamId();
    if (this.filterStatus()) params['status'] = this.filterStatus();

    forkJoin({
      sessions: this.mockExamService.getAllSessions(params),
      stats: this.mockExamService.getSessionStats(),
    }).subscribe({
      next: ({ sessions, stats }) => {
        this.sessions.set(sessions.data);
        this.stats.set(stats.data);
        this.loadingSessions.set(false);
      },
      error: () => {
        this.loadingSessions.set(false);
      },
    });
  }

  getExamName(examId: string): string {
    return this.examMap().get(examId)?.name ?? '—';
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }

  formatTimeSpent(seconds?: number): string {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}min`;
    if (m > 0) return `${m}min ${s}s`;
    return `${s}s`;
  }

  formatScore(score?: number): string {
    if (score == null) return '—';
    return `${Math.round(score)}%`;
  }

  onFilterChange() {
    this.loadSessions();
  }

  openCreateDialog() {
    const ref = this.dialog.open(MockExamDialog, {
      data: { exams: this.examMap() },
      width: '700px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.mockExamService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Simulado criado com sucesso!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao criar simulado.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(mockExam: MockExam) {
    const ref = this.dialog.open(MockExamDialog, {
      data: { mockExam, exams: this.examMap() },
      width: '700px',
      maxWidth: '95vw',
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.mockExamService.update(mockExam.id, result).subscribe({
          next: () => {
            this.snackBar.open('Simulado atualizado!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao atualizar simulado.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  togglePublished(mockExam: MockExam) {
    this.mockExamService.update(mockExam.id, { published: !mockExam.published }).subscribe({
      next: () => {
        this.snackBar.open(
          mockExam.published ? 'Simulado despublicado.' : 'Simulado publicado!',
          'OK',
          { duration: 3000 },
        );
        this.loadData();
      },
      error: () => this.snackBar.open('Erro ao alterar status de publicação.', 'OK', { duration: 3000 }),
    });
  }

  confirmDelete(mockExam: MockExam) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Excluir Simulado',
        message: `Deseja excluir "${mockExam.name}"? Esta ação não pode ser desfeita.`,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.mockExamService.delete(mockExam.id).subscribe({
          next: () => {
            this.snackBar.open('Simulado excluído!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao excluir simulado.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  confirmDeleteSession(session: MockExamSessionAdmin) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Excluir Sessão',
        message: `Deseja excluir esta sessão de "${session.mockExamName}"? O resultado será perdido.`,
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.mockExamService.deleteSession(session.id).subscribe({
          next: () => {
            this.snackBar.open('Sessão excluída!', 'OK', { duration: 3000 });
            this.loadSessions();
          },
          error: () => this.snackBar.open('Erro ao excluir sessão.', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
