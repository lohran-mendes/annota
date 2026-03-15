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
import { MockExamService } from '../../../core/services/mock-exam.service';
import { ExamService } from '../../../core/services/exam.service';
import { MockExamDialog } from '../dialogs/mock-exam-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import type { Exam, MockExam } from '@annota/shared';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'annota-mock-exam-management',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatTableModule, MatSlideToggleModule, MatProgressSpinnerModule,
    MatTooltipModule,
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
  private examMap = signal<Map<string, Exam>>(new Map());
  loading = signal(false);
  displayedColumns = ['name', 'exam', 'questions', 'duration', 'published', 'actions'];

  ngOnInit() {
    this.loadData();
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

  getExamName(examId: string): string {
    return this.examMap().get(examId)?.name ?? '—';
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
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
}
