import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DeckService } from '../../../core/services/deck.service';
import { MOCK_DECKS } from '../../../core/mock-data';
import type { Deck } from '@annota/shared';

@Component({
  selector: 'annota-deck-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './deck-list.html',
  styleUrl: './deck-list.scss',
})
export class DeckList implements OnInit {
  private readonly router = inject(Router);
  private readonly deckService = inject(DeckService);
  private readonly snackBar = inject(MatSnackBar);

  decks = signal<Deck[]>([]);
  loading = signal(false);
  showCreateForm = signal(false);
  newDeckName = signal('');
  newDeckDescription = signal('');
  creating = signal(false);

  ngOnInit(): void {
    this.loadDecks();
  }

  private loadDecks(): void {
    this.loading.set(true);
    this.deckService.getAll().subscribe({
      next: (res) => {
        this.decks.set(res.data.length > 0 ? res.data : MOCK_DECKS);
        this.loading.set(false);
      },
      error: () => {
        this.decks.set(MOCK_DECKS);
        this.loading.set(false);
      },
    });
  }

  createDeck(): void {
    const name = this.newDeckName().trim();
    if (!name) return;

    this.creating.set(true);
    this.deckService.create({ name, description: this.newDeckDescription().trim() }).subscribe({
      next: () => {
        this.snackBar.open('Baralho criado com sucesso!', 'OK', { duration: 3000 });
        this.newDeckName.set('');
        this.newDeckDescription.set('');
        this.showCreateForm.set(false);
        this.creating.set(false);
        this.loadDecks();
      },
      error: () => {
        this.snackBar.open('Erro ao criar baralho. Tente novamente.', 'OK', { duration: 3000 });
        this.creating.set(false);
      },
    });
  }

  openDeck(deckId: string): void {
    this.router.navigate(['/flashcards', deckId]);
  }

  startReview(deckId: string): void {
    this.router.navigate(['/flashcards', deckId, 'review']);
  }

  deleteDeck(deck: Deck): void {
    if (!window.confirm(`Deseja excluir o baralho "${deck.name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }
    this.deckService.delete(deck.id).subscribe({
      next: () => {
        this.snackBar.open('Baralho excluído.', 'OK', { duration: 3000 });
        this.loadDecks();
      },
      error: () => {
        this.snackBar.open('Erro ao excluir baralho.', 'OK', { duration: 3000 });
      },
    });
  }
}
