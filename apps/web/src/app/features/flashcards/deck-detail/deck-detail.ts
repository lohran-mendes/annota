import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FlashcardService } from '../../../core/services/flashcard.service';
import { DeckService } from '../../../core/services/deck.service';
import type { Deck, Flashcard } from '@annota/shared';

@Component({
  selector: 'annota-deck-detail',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
  ],
  templateUrl: './deck-detail.html',
  styleUrl: './deck-detail.scss',
})
export class DeckDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly flashcardService = inject(FlashcardService);
  private readonly deckService = inject(DeckService);
  private readonly snackBar = inject(MatSnackBar);

  private deckId = '';

  deck = signal<Deck | null>(null);
  cards = signal<Flashcard[]>([]);
  loading = signal(true);
  showAddForm = signal(false);
  newCardFront = signal('');
  newCardBack = signal('');
  addingCard = signal(false);
  editingCard = signal<Flashcard | null>(null);
  editFront = signal('');
  editBack = signal('');
  savingEdit = signal(false);
  expandedCardId = signal<string | null>(null);

  dueCount = computed(() => {
    const now = new Date();
    return this.cards().filter((c) => new Date(c.nextReviewDate) <= now).length;
  });

  ngOnInit(): void {
    this.deckId = this.route.snapshot.paramMap.get('deckId') ?? '';
    this.loadDeck();
    this.loadCards();
  }

  private loadDeck(): void {
    this.deckService.getById(this.deckId).subscribe({
      next: (res) => {
        this.deck.set(res.data);
      },
      error: () => {
        this.deck.set(null);
      },
    });
  }

  private loadCards(): void {
    this.loading.set(true);
    this.flashcardService.getByDeck(this.deckId).subscribe({
      next: (res) => {
        this.cards.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  addCard(): void {
    const front = this.newCardFront().trim();
    const back = this.newCardBack().trim();
    if (!front || !back) return;

    this.addingCard.set(true);
    this.flashcardService.create({ deckId: this.deckId, front, back }).subscribe({
      next: () => {
        this.snackBar.open('Cartão adicionado!', 'OK', { duration: 3000 });
        this.newCardFront.set('');
        this.newCardBack.set('');
        this.showAddForm.set(false);
        this.addingCard.set(false);
        this.loadCards();
      },
      error: () => {
        this.snackBar.open('Erro ao adicionar cartão. Tente novamente.', 'OK', { duration: 3000 });
        this.addingCard.set(false);
      },
    });
  }

  deleteCard(card: Flashcard): void {
    if (!window.confirm('Deseja excluir este cartão?')) return;

    this.flashcardService.delete(card.id).subscribe({
      next: () => {
        this.snackBar.open('Cartão excluído.', 'OK', { duration: 3000 });
        this.loadCards();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir cartão.', 'OK', { duration: 3000 });
      },
    });
  }

  startEdit(card: Flashcard): void {
    this.editingCard.set(card);
    this.editFront.set(card.front);
    this.editBack.set(card.back);
    this.expandedCardId.set(card.id);
  }

  saveEdit(): void {
    const card = this.editingCard();
    if (!card) return;

    const front = this.editFront().trim();
    const back = this.editBack().trim();
    if (!front || !back) return;

    this.savingEdit.set(true);
    this.flashcardService.update(card.id, { front, back }).subscribe({
      next: () => {
        this.snackBar.open('Cartão atualizado!', 'OK', { duration: 3000 });
        this.editingCard.set(null);
        this.savingEdit.set(false);
        this.loadCards();
      },
      error: () => {
        this.snackBar.open('Erro ao atualizar cartão.', 'OK', { duration: 3000 });
        this.savingEdit.set(false);
      },
    });
  }

  cancelEdit(): void {
    this.editingCard.set(null);
    this.editFront.set('');
    this.editBack.set('');
  }

  toggleExpand(cardId: string): void {
    this.expandedCardId.set(this.expandedCardId() === cardId ? null : cardId);
  }

  startReview(): void {
    this.router.navigate(['/flashcards', this.deckId, 'review']);
  }

  goBack(): void {
    this.router.navigate(['/flashcards']);
  }

  isEditing(cardId: string): boolean {
    return this.editingCard()?.id === cardId;
  }

  isExpanded(cardId: string): boolean {
    return this.expandedCardId() === cardId;
  }
}
