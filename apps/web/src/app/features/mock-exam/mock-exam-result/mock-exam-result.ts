import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'annota-mock-exam-result',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './mock-exam-result.html',
  styleUrl: './mock-exam-result.scss',
})
export class MockExamResult {
  score = signal(72);
  totalQuestions = signal(50);
  correctAnswers = signal(36);
  timeSpent = signal('1h 42min');

  subjectResults = signal([
    { name: 'Matemática', correct: 10, total: 15, color: '#E91E63' },
    { name: 'Português', correct: 8, total: 12, color: '#9C27B0' },
    { name: 'Ciências', correct: 7, total: 10, color: '#00BCD4' },
    { name: 'História', correct: 6, total: 8, color: '#FF7043' },
    { name: 'Geografia', correct: 5, total: 5, color: '#66BB6A' },
  ]);

  getPercent(correct: number, total: number): number {
    return total > 0 ? Math.round((correct / total) * 100) : 0;
  }
}
