import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { ExamService } from '../../core/services/exam.service';
import { ProgressService } from '../../core/services/progress.service';
import { AuthService } from '../../core/services/auth.service';
import { CreateExamDialog } from './create-exam-dialog';
import { ConfirmDialog } from './confirm-dialog';
import type { CreateExamDto, Exam, UserProgress } from '@annota/shared';

@Component({
  selector: 'annota-home',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly progressService = inject(ProgressService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);

  readonly isAdmin = this.authService.isAdmin;

  exams = signal<Exam[]>([]);
  loading = signal(false);
  progress = signal<UserProgress>({ totalAnswered: 0, totalCorrect: 0, streak: 0, bySubject: [] });

  ngOnInit() {
    this.loadExams();
    this.loadProgress();
  }

  private loadExams() {
    this.loading.set(true);
    this.examService.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private loadProgress() {
    this.progressService.getGlobalProgress().subscribe({
      next: (res) => {
        this.progress.set(res.data);
      },
      error: () => {},
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateExamDialog, {
      width: '520px',
      maxWidth: '95vw',
    });

    ref.afterClosed().subscribe((dto: CreateExamDto | null) => {
      if (!dto) return;
      this.examService.create(dto).subscribe({
        next: () => this.loadExams(),
        error: (err) => console.error('Erro ao criar prova', err),
      });
    });
  }

  deleteExam(exam: Exam, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    const ref = this.dialog.open(ConfirmDialog, {
      width: '420px',
      maxWidth: '95vw',
      data: {
        title: 'Excluir prova',
        message: `Tem certeza que deseja excluir a prova "${exam.name}"? Esta ação não pode ser desfeita.`,
        confirmLabel: 'Excluir',
      },
    });

    ref.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;

      this.examService.delete(exam.id).subscribe({
        next: () => this.loadExams(),
        error: (err) => console.error('Erro ao excluir prova', err),
      });
    });
  }

  get accuracyPercent(): number {
    const p = this.progress();
    return p.totalAnswered > 0
      ? Math.round((p.totalCorrect / p.totalAnswered) * 100)
      : 0;
  }
}
