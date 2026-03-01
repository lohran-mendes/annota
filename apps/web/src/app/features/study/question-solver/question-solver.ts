import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MOCK_QUESTIONS } from '../../../core/mock-data';
import type { Question } from '@annota/shared';

@Component({
  selector: 'annota-question-solver',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatDividerModule,
    FormsModule,
  ],
  templateUrl: './question-solver.html',
  styleUrl: './question-solver.scss',
})
export class QuestionSolver {
  questions = signal<Question[]>(MOCK_QUESTIONS);
  currentIndex = signal(0);
  selectedAnswer = signal<number | null>(null);
  answered = signal(false);

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);

  get isCorrect(): boolean {
    return this.selectedAnswer() === this.currentQuestion().correctAnswerIndex;
  }

  get totalQuestions(): number {
    return this.questions().length;
  }

  selectAnswer(index: number) {
    if (!this.answered()) {
      this.selectedAnswer.set(index);
    }
  }

  checkAnswer() {
    if (this.selectedAnswer() !== null) {
      this.answered.set(true);
    }
  }

  nextQuestion() {
    if (this.currentIndex() < this.totalQuestions - 1) {
      this.currentIndex.update((i) => i + 1);
      this.selectedAnswer.set(null);
      this.answered.set(false);
    }
  }

  previousQuestion() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((i) => i - 1);
      this.selectedAnswer.set(null);
      this.answered.set(false);
    }
  }

  getAlternativeClass(index: number): string {
    if (!this.answered()) {
      return this.selectedAnswer() === index ? 'selected' : '';
    }
    if (index === this.currentQuestion().correctAnswerIndex) {
      return 'correct';
    }
    if (this.selectedAnswer() === index) {
      return 'incorrect';
    }
    return 'dimmed';
  }
}
