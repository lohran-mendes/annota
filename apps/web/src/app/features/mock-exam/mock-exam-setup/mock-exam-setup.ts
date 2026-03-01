import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MOCK_MOCK_EXAMS } from '../../../core/mock-data';
import type { MockExamConfig } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-setup',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './mock-exam-setup.html',
  styleUrl: './mock-exam-setup.scss',
})
export class MockExamSetup {
  mockExams = signal<MockExamConfig[]>(MOCK_MOCK_EXAMS);

  constructor(private router: Router) {}

  startExam(exam: MockExamConfig) {
    this.router.navigate(['/mock-exam', exam.id]);
  }

  viewResult(exam: MockExamConfig) {
    this.router.navigate(['/mock-exam', exam.id, 'result']);
  }

  formatDuration(minutes: number): string {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h${m > 0 ? ` ${m}min` : ''}` : `${m}min`;
  }
}
