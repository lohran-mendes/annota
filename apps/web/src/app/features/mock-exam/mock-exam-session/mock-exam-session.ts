import { Component, signal, computed, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MockExamService } from '../../../core/services/mock-exam.service';
import type { MockExamQuestion, MockExamConfig, MockExamAnswer } from '@annota/shared';

@Component({
  selector: 'annota-mock-exam-session',
  imports: [
    MatCardModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule, MatSnackBarModule,
  ],
  templateUrl: './mock-exam-session.html',
  styleUrl: './mock-exam-session.scss',
})
export class MockExamSession implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly mockExamService = inject(MockExamService);
  private readonly snackBar = inject(MatSnackBar);

  config = signal<MockExamConfig | null>(null);
  questions = signal<MockExamQuestion[]>([]);
  currentIndex = signal(0);
  answers = signal<Map<number, number>>(new Map());
  timeRemaining = signal(0);
  loading = signal(true);
  submitting = signal(false);
  private timerInterval: ReturnType<typeof setInterval> | null = null;
  private mockExamId = '';
  private startTime = 0;

  currentQuestion = computed(() => this.questions()[this.currentIndex()]);
  answeredCount = computed(() => this.answers().size);

  ngOnInit() {
    this.mockExamId = this.route.snapshot.paramMap.get('mockExamId') ?? '';
    this.startTime = Date.now();
    this.loadSession();
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private loadSession() {
    this.loading.set(true);
    this.mockExamService.getById(this.mockExamId).subscribe({
      next: (res) => {
        this.config.set(res.data.config);
        this.questions.set(res.data.questions);
        this.timeRemaining.set(res.data.config.duration * 60);
        this.loading.set(false);
        this.startTimer();
      },
      error: () => {
        this.snackBar.open('Erro ao carregar simulado.', 'OK', { duration: 3000 });
        this.router.navigate(['/mock-exam']);
      },
    });
  }

  private startTimer() {
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
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.submitting()) return;
    this.submitting.set(true);

    const timeSpent = Math.floor((Date.now() - this.startTime) / 1000);
    const answersMap = this.answers();
    const questionList = this.questions();

    const answersArray: MockExamAnswer[] = [];
    answersMap.forEach((selectedIndex, questionIndex) => {
      const question = questionList[questionIndex];
      if (question) {
        answersArray.push({
          questionId: question.id,
          selectedIndex,
        });
      }
    });

    this.mockExamService.submit(this.mockExamId, {
      answers: answersArray,
      timeSpent,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.router.navigate(['/mock-exam', this.mockExamId, 'result']);
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('Erro ao enviar respostas. Tente novamente.', 'OK', { duration: 3000 });
      },
    });
  }
}
