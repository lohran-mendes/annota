import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { MOCK_QUESTIONS } from '../../../core/mock-data';
import { QuestionService } from '../../../core/services/question.service';
import { AnswerService } from '../../../core/services/answer.service';
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
export class QuestionSolver implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(QuestionService);
  private readonly answerService = inject(AnswerService);

  examId = '';
  private topicId = '';
  questions = signal<Question[]>([]);
  currentIndex = signal(0);
  selectedAnswer = signal<number | null>(null);
  answered = signal(false);
  loading = signal(true);

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);

  ngOnInit() {
    this.examId = this.route.snapshot.params['examId'] ?? '';
    this.topicId = this.route.snapshot.params['topicId'] ?? '';
    this.loading.set(true);

    if (this.topicId) {
      this.questionService.getByTopic(this.topicId).subscribe({
        next: (res) => {
          const apiQuestions = res.data;
          if (apiQuestions.length > 0) {
            this.questions.set(apiQuestions);
          } else {
            this.questions.set(MOCK_QUESTIONS.filter((q) => q.topicId === this.topicId));
          }
          this.loading.set(false);
        },
        error: () => {
          this.questions.set(MOCK_QUESTIONS.filter((q) => q.topicId === this.topicId));
          this.loading.set(false);
        },
      });
    } else {
      this.questionService.getAll().subscribe({
        next: (res) => {
          this.questions.set(res.data.length > 0 ? res.data : MOCK_QUESTIONS);
          this.loading.set(false);
        },
        error: () => {
          this.questions.set(MOCK_QUESTIONS);
          this.loading.set(false);
        },
      });
    }
  }

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
      this.answerService
        .submitAnswer({
          questionId: this.currentQuestion().id,
          selectedIndex: this.selectedAnswer()!,
          examId: this.examId,
        })
        .subscribe({
          error: (err) => {
            console.error('Failed to submit answer to API:', err);
          },
        });
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
