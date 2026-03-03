import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlashcardService } from '../../../core/services/flashcard.service';
import { MOCK_FLASHCARDS } from '../../../core/mock-data';
import type { Flashcard, FlashcardRating } from '@annota/shared';

@Component({
  selector: 'annota-review-session',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './review-session.html',
  styleUrl: './review-session.scss',
})
export class ReviewSession implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flashcardService = inject(FlashcardService);
  private readonly snackBar = inject(MatSnackBar);

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

  ngOnInit(): void {
    this.deckId = this.route.snapshot.paramMap.get('deckId') ?? '';
    this.loadDueCards();
  }

  private loadDueCards(): void {
    this.loading.set(true);
    this.flashcardService.getDueByDeck(this.deckId).subscribe({
      next: (res) => {
        this.cards.set(res.data.length > 0 ? res.data : this.getMockDueCards());
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
      next: () => this.advanceCard(),
      error: () => this.advanceCard(),
    });
  }

  private advanceCard(): void {
    this.reviewing.set(false);
    this.showAnswer.set(false);
    this.reviewedCount.update((n) => n + 1);

    if (this.currentIndex() + 1 >= this.totalCards()) {
      this.sessionComplete.set(true);
    } else {
      this.currentIndex.update((i) => i + 1);
    }
  }

  goBackToDeck(): void {
    this.router.navigate(['/flashcards', this.deckId]);
  }
}
