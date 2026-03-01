import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MOCK_EXAMS, MOCK_PROGRESS } from '../../core/mock-data';
import type { Exam, UserProgress } from '@annota/shared';

@Component({
  selector: 'annota-home',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  exams = signal<Exam[]>(MOCK_EXAMS);
  progress = signal<UserProgress>(MOCK_PROGRESS);

  get accuracyPercent(): number {
    const p = this.progress();
    return p.totalAnswered > 0
      ? Math.round((p.totalCorrect / p.totalAnswered) * 100)
      : 0;
  }
}
