import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ExamService } from '../../../core/services/exam.service';
import { MockExamService } from '../../../core/services/mock-exam.service';
import type { Exam, MockExamConfig } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-setup',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatChipsModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './mock-exam-setup.html',
  styleUrl: './mock-exam-setup.scss',
})
export class MockExamSetup implements OnInit {
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly mockExamService = inject(MockExamService);
  private readonly snackBar = inject(MatSnackBar);

  exams = signal<Exam[]>([]);
  mockExamHistory = signal<MockExamConfig[]>([]);
  loadingExams = signal(false);
  loadingHistory = signal(false);
  startingExam = signal<string | null>(null);

  ngOnInit(): void {
    this.loadExams();
    this.loadHistory();
  }

  loadExams() {
    this.loadingExams.set(true);
    this.examService.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data.filter(e => e.questionCount > 0));
        this.loadingExams.set(false);
      },
      error: () => {
        this.loadingExams.set(false);
      },
    });
  }

  loadHistory() {
    this.loadingHistory.set(true);
    this.mockExamService.getAll().subscribe({
      next: (res) => {
        this.mockExamHistory.set(res.data);
        this.loadingHistory.set(false);
      },
      error: () => {
        this.loadingHistory.set(false);
      },
    });
  }

  startExam(exam: Exam) {
    this.startingExam.set(exam.id);
    const dto = {
      examId: exam.id,
      name: `Simulado - ${exam.name}`,
      questionCount: exam.questionCount,
      duration: exam.duration,
    };
    this.mockExamService.create(dto).subscribe({
      next: (res) => {
        this.startingExam.set(null);
        this.router.navigate(['/mock-exam', res.data.config.id]);
      },
      error: () => {
        this.startingExam.set(null);
        this.snackBar.open('Erro ao iniciar simulado. Tente novamente.', 'OK', { duration: 3000 });
      },
    });
  }

  continueExam(mockExam: MockExamConfig) {
    this.router.navigate(['/mock-exam', mockExam.id]);
  }

  viewResult(mockExam: MockExamConfig) {
    this.router.navigate(['/mock-exam', mockExam.id, 'result']);
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }
}
