import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExamService } from '../../../core/services/exam.service';
import type { Exam } from '@annota/shared';

@Component({
  selector: 'annota-exam-selector',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './exam-selector.html',
  styleUrl: './exam-selector.scss',
})
export class ExamSelector implements OnInit {
  private readonly examService = inject(ExamService);

  exams = signal<Exam[]>([]);
  loading = signal(false);

  ngOnInit() {
    this.loadExams();
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
}
