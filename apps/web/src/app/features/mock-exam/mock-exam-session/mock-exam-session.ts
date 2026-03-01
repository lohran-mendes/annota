import { Component, signal, computed, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MOCK_QUESTIONS } from '../../../core/mock-data';
import type { Question } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-session',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatDividerModule],
  templateUrl: './mock-exam-session.html',
  styleUrl: './mock-exam-session.scss',
})
export class MockExamSession implements OnDestroy {
  questions = signal<Question[]>(MOCK_QUESTIONS);
  currentIndex = signal(0);
  answers = signal<Map<number, number>>(new Map());
  timeRemaining = signal(5400); // 90 min in seconds
  private timerInterval: ReturnType<typeof setInterval>;

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  answeredCount = computed(() => this.answers().size);

  constructor(private router: Router) {
    this.timerInterval = setInterval(() => {
      this.timeRemaining.update((t) => {
        if (t <= 0) {
          this.finishExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timerInterval);
  }

  get formattedTime(): string {
    const t = this.timeRemaining();
    const h = Math.floor(t / 3600);
    const m = Math.floor((t % 3600) / 60);
    const s = t % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  selectAnswer(index: number) {
    const newMap = new Map(this.answers());
    newMap.set(this.currentIndex(), index);
    this.answers.set(newMap);
  }

  getSelectedAnswer(): number | null {
    return this.answers().get(this.currentIndex()) ?? null;
  }

  goToQuestion(index: number) {
    this.currentIndex.set(index);
  }

  nextQuestion() {
    if (this.currentIndex() < this.questions().length - 1) {
      this.currentIndex.update((i) => i + 1);
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
    }
  }

  isAnswered(index: number): boolean {
    return this.answers().has(index);
  }

  finishExam() {
    clearInterval(this.timerInterval);
    this.router.navigate(['/mock-exam', '1', 'result']);
  }
}
