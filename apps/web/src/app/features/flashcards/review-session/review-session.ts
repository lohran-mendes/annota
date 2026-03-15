import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { FlashcardService } from '../../../core/services/flashcard.service';
import { MOCK_FLASHCARDS } from '../../../core/mock-data';
import type { Flashcard, FlashcardRating, PredictedIntervals } from '@annota/shared';

@Component({
  selector: 'annota-review-session',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './review-session.html',
  styleUrl: './review-session.scss',
})
export class ReviewSession implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flashcardService = inject(FlashcardService);
  cards = signal<Flashcard[]>([]);
  currentIndex = signal(0);
  showAnswer = signal(false);
  loading = signal(true);
  reviewing = signal(false);
  sessionComplete = signal(false);
  reviewedCount = signal(0);
  private deckId = '';

  currentCard = computed(() => this.cards()[this.currentIndex()]);
  totalCards = computed(() => this.cards().length);
  progress = computed(() => {
    const total = this.totalCards();
    return total > 0 ? (this.reviewedCount() / total) * 100 : 0;
  });

  /** Intervalos previstos para o cartão atual */
  predictedIntervals = computed<PredictedIntervals>(() => {
    const card = this.currentCard();
    if (!card) return { again: 0, hard: 1, good: 1, easy: 4 };
    return this.calcPredictedIntervals(card);
  });

  ngOnInit(): void {
    this.deckId = this.route.snapshot.paramMap.get('deckId') ?? '';
    this.loadDueCards();
  }

  private loadDueCards(): void {
    this.loading.set(true);
    this.flashcardService.getDueByDeck(this.deckId).subscribe({
      next: (res) => {
        this.cards.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.cards.set(this.getMockDueCards());
        this.loading.set(false);
      },
    });
  }

  private getMockDueCards(): Flashcard[] {
    const now = new Date();
    return MOCK_FLASHCARDS.filter(
      (c) => c.deckId === this.deckId && new Date(c.nextReviewDate) <= now,
    );
  }

  revealAnswer(): void {
    this.showAnswer.set(true);
  }

  rate(rating: FlashcardRating): void {
    const card = this.currentCard();
    if (!card) return;

    this.reviewing.set(true);
    this.flashcardService.review(card.id, { rating }).subscribe({
      next: () => this.advanceCard(rating, card),
      error: () => this.advanceCard(rating, card),
    });
  }

  private advanceCard(rating: FlashcardRating, reviewedCard: Flashcard): void {
    this.reviewing.set(false);
    this.showAnswer.set(false);
    this.reviewedCount.update((n) => n + 1);

    if (rating === 1) {
      // "Again" — reinsere o cartão no final da fila (comportamento Anki)
      // Atualiza o cartão com repetitions=0 para que o predict funcione
      const lapsedCard: Flashcard = {
        ...reviewedCard,
        repetitions: 0,
        interval: 0,
        easeFactor: Math.max(1.3, reviewedCard.easeFactor - 0.2),
      };
      this.cards.update((list) => {
        const updated = [...list];
        // Remove da posição atual e adiciona no final
        updated.splice(this.currentIndex(), 1);
        updated.push(lapsedCard);
        return updated;
      });
      // Não incrementa currentIndex — o próximo cartão "cai" na posição atual
    } else {
      // Para Hard/Good/Easy: avança normalmente
      if (this.currentIndex() + 1 >= this.totalCards()) {
        this.sessionComplete.set(true);
      } else {
        this.currentIndex.update((i) => i + 1);
      }
    }
  }

  goBackToDeck(): void {
    this.router.navigate(['/flashcards', this.deckId]);
  }

  /**
   * Calcula intervalos previstos client-side (espelha a lógica do backend).
   * Evita chamada de API extra para cada cartão.
   */
  private calcPredictedIntervals(card: Flashcard): PredictedIntervals {
    const { interval, easeFactor, repetitions } = card;

    const calc = (r: 1 | 2 | 3 | 4): number => {
      switch (r) {
        case 1: return 0; // Again — revisão imediata na sessão
        case 2: // Hard
          if (repetitions === 0) return 1;
          return Math.max(1, Math.round(interval * 1.2));
        case 3: // Good
          if (repetitions === 0) return 1;
          if (repetitions === 1) return 6;
          return Math.round(interval * easeFactor);
        case 4: // Easy
          if (repetitions === 0) return 4;
          if (repetitions === 1) return Math.round(6 * 1.3);
          return Math.round(interval * easeFactor * 1.3);
      }
    };

    return {
      again: calc(1),
      hard: calc(2),
      good: calc(3),
      easy: calc(4),
    };
  }

  /** Formata intervalo em dias para exibição legível */
  formatInterval(days: number): string {
    if (days === 0) return 'agora';
    if (days === 1) return '1d';
    if (days < 30) return `${days}d`;
    if (days < 365) {
      const months = Math.round(days / 30);
      return `${months}m`;
    }
    const years = (days / 365).toFixed(1);
    return `${years}a`;
  }
}
