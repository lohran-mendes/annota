import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import type { Exam, Question, Subject, Topic } from '@annota/shared';
import { QuestionService } from '../../../core/services/question.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { forkJoin } from 'rxjs';

export interface ExamDialogData {
  exam?: Exam;
}

@Component({
  selector: 'annota-exam-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatCheckboxModule,
    MatChipsModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.exam ? 'Editar Prova' : 'Nova Prova' }}</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Informações">
          <form [formGroup]="form" class="dialog-form">
            <mat-form-field appearance="outline">
              <mat-label>Nome</mat-label>
              <input matInput formControlName="name" placeholder="Ex: Vestibulinho ETEC 2026">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Instituição</mat-label>
              <input matInput formControlName="institution" placeholder="Ex: Centro Paula Souza">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Ano</mat-label>
              <input matInput type="number" formControlName="year" placeholder="2026">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Duração (minutos)</mat-label>
              <input matInput type="number" formControlName="duration" placeholder="180">
              <mat-hint>Tempo da prova em minutos</mat-hint>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Descrição</mat-label>
              <textarea matInput formControlName="description" rows="3"
                        placeholder="Descreva a prova..."></textarea>
            </mat-form-field>
          </form>
        </mat-tab>

        <mat-tab label="Questões">
          <div class="questions-tab">
            @if (loadingQuestions()) {
              <div class="loading-container">
                <mat-spinner diameter="32"></mat-spinner>
                <span>Carregando questões...</span>
              </div>
            } @else {
              <!-- Filtros -->
              <div class="filters">
                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Matéria</mat-label>
                  <mat-select (selectionChange)="onSubjectFilterChange($event.value)" [value]="subjectFilter()">
                    <mat-option value="">Todas</mat-option>
                    @for (subject of allSubjects(); track subject.id) {
                      <mat-option [value]="subject.id">{{ subject.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field">
                  <mat-label>Tópico</mat-label>
                  <mat-select (selectionChange)="onTopicFilterChange($event.value)" [value]="topicFilter()">
                    <mat-option value="">Todos</mat-option>
                    @for (topic of filteredTopics(); track topic.id) {
                      <mat-option [value]="topic.id">{{ topic.name }}</mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline" class="filter-field search-field">
                  <mat-label>Buscar</mat-label>
                  <input matInput (input)="onSearchChange($event)" placeholder="Buscar por enunciado...">
                  <mat-icon matPrefix>search</mat-icon>
                </mat-form-field>
              </div>

              <!-- Header de seleção -->
              <div class="selection-header">
                <mat-checkbox
                  [checked]="allFilteredSelected()"
                  [indeterminate]="someFilteredSelected() && !allFilteredSelected()"
                  (change)="toggleAllFiltered($event.checked)">
                  Selecionar todos ({{ filteredQuestions().length }})
                </mat-checkbox>
                <span class="selection-count">
                  {{ selectedQuestionIds().size }} questão(ões) selecionada(s)
                </span>
              </div>

              <!-- Lista de questões -->
              <div class="question-list">
                @for (question of filteredQuestions(); track question.id) {
                  <div class="question-row" [class.selected]="selectedQuestionIds().has(question.id)">
                    <mat-checkbox
                      [checked]="selectedQuestionIds().has(question.id)"
                      (change)="toggleQuestion(question.id)">
                    </mat-checkbox>
                    <span class="question-statement">{{ truncate(question.statement, 80) }}</span>
                    <div class="question-chips">
                      <mat-chip [style.--mdc-chip-label-text-color]="getSubjectColor(question.subjectId)">
                        {{ getSubjectName(question.subjectId) }}
                      </mat-chip>
                      <mat-chip>{{ getTopicName(question.topicId) }}</mat-chip>
                    </div>
                  </div>
                }
                @if (filteredQuestions().length === 0) {
                  <div class="empty-state">
                    <mat-icon>search_off</mat-icon>
                    <p>Nenhuma questão encontrada com os filtros aplicados.</p>
                  </div>
                }
              </div>

              <!-- Resumo -->
              <div class="summary">
                <span><strong>{{ selectedQuestionIds().size }}</strong> questões</span>
                <span>|</span>
                <span><strong>{{ derivedSubjectCount() }}</strong> matérias</span>
                <span>|</span>
                <span><strong>{{ derivedTopicCount() }}</strong> tópicos</span>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.exam ? 'Salvar' : 'Criar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 500px;
      padding-top: 16px;
    }

    .questions-tab {
      padding-top: 16px;
      min-width: 500px;
    }

    .filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-field {
      flex: 1;
      min-width: 140px;
    }

    .search-field {
      flex: 2;
    }

    .selection-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid var(--mat-sys-outline-variant, #e0e0e0);
    }

    .selection-count {
      font-size: 13px;
      color: var(--mat-sys-on-surface-variant, #666);
    }

    .question-list {
      max-height: 320px;
      overflow-y: auto;
    }

    .question-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 4px;
      border-bottom: 1px solid var(--mat-sys-outline-variant, #f0f0f0);
      transition: background-color 0.15s;
    }

    .question-row:hover {
      background-color: var(--mat-sys-surface-variant, #f5f5f5);
    }

    .question-row.selected {
      background-color: var(--mat-sys-secondary-container, #e8f0fe);
    }

    .question-statement {
      flex: 1;
      font-size: 13px;
      line-height: 1.4;
    }

    .question-chips {
      display: flex;
      gap: 4px;
      flex-shrink: 0;
    }

    .summary {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 12px 0 4px;
      font-size: 14px;
      color: var(--mat-sys-on-surface-variant, #555);
    }

    .loading-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 24px;
      justify-content: center;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px;
      color: var(--mat-sys-on-surface-variant, #999);
    }

    @media (max-width: 599px) {
      .dialog-form, .questions-tab { min-width: unset; }
      .filters { flex-direction: column; }
      .question-chips { display: none; }
    }
  `],
})
export class ExamDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ExamDialog>);
  readonly data = inject<ExamDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly questionService = inject(QuestionService);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);

  form = this.fb.group({
    name: [this.data.exam?.name ?? '', Validators.required],
    institution: [this.data.exam?.institution ?? '', Validators.required],
    year: [this.data.exam?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    duration: [this.data.exam?.duration ?? 180, [Validators.required, Validators.min(1)]],
    description: [this.data.exam?.description ?? '', Validators.required],
  });

  // State signals
  loadingQuestions = signal(true);
  allQuestions = signal<Question[]>([]);
  allSubjects = signal<Subject[]>([]);
  allTopics = signal<Topic[]>([]);
  selectedQuestionIds = signal<Set<string>>(
    new Set(this.data.exam?.questionIds ?? []),
  );
  subjectFilter = signal('');
  topicFilter = signal('');
  searchFilter = signal('');

  // Maps para lookup rapido
  private subjectMap = new Map<string, Subject>();
  private topicMap = new Map<string, Topic>();

  // Computed
  filteredTopics = computed(() => {
    const subjectId = this.subjectFilter();
    if (!subjectId) return this.allTopics();
    return this.allTopics().filter((t) => t.subjectId === subjectId);
  });

  filteredQuestions = computed(() => {
    let questions = this.allQuestions();
    const subjectId = this.subjectFilter();
    const topicId = this.topicFilter();
    const search = this.searchFilter().toLowerCase();

    if (subjectId) questions = questions.filter((q) => q.subjectId === subjectId);
    if (topicId) questions = questions.filter((q) => q.topicId === topicId);
    if (search) questions = questions.filter((q) => q.statement.toLowerCase().includes(search));

    return questions;
  });

  allFilteredSelected = computed(() => {
    const filtered = this.filteredQuestions();
    if (!filtered.length) return false;
    const selected = this.selectedQuestionIds();
    return filtered.every((q) => selected.has(q.id));
  });

  someFilteredSelected = computed(() => {
    const filtered = this.filteredQuestions();
    const selected = this.selectedQuestionIds();
    return filtered.some((q) => selected.has(q.id));
  });

  derivedSubjectCount = computed(() => {
    const selected = this.selectedQuestionIds();
    const questions = this.allQuestions().filter((q) => selected.has(q.id));
    return new Set(questions.map((q) => q.subjectId)).size;
  });

  derivedTopicCount = computed(() => {
    const selected = this.selectedQuestionIds();
    const questions = this.allQuestions().filter((q) => selected.has(q.id));
    return new Set(questions.map((q) => q.topicId)).size;
  });

  ngOnInit() {
    forkJoin({
      questions: this.questionService.getAll(),
      subjects: this.subjectService.getAll(),
      topics: this.topicService.getAll(),
    }).subscribe({
      next: ({ questions, subjects, topics }) => {
        this.allQuestions.set(questions.data);
        this.allSubjects.set(subjects.data);
        this.allTopics.set(topics.data);
        this.subjectMap = new Map(subjects.data.map((s) => [s.id, s]));
        this.topicMap = new Map(topics.data.map((t) => [t.id, t]));
        this.loadingQuestions.set(false);
      },
      error: () => {
        this.loadingQuestions.set(false);
      },
    });
  }

  onSubjectFilterChange(value: string) {
    this.subjectFilter.set(value);
    this.topicFilter.set('');
  }

  onTopicFilterChange(value: string) {
    this.topicFilter.set(value);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchFilter.set(value);
  }

  toggleQuestion(id: string) {
    const current = new Set(this.selectedQuestionIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedQuestionIds.set(current);
  }

  toggleAllFiltered(checked: boolean) {
    const current = new Set(this.selectedQuestionIds());
    for (const q of this.filteredQuestions()) {
      if (checked) {
        current.add(q.id);
      } else {
        current.delete(q.id);
      }
    }
    this.selectedQuestionIds.set(current);
  }

  getSubjectName(id: string): string {
    return this.subjectMap.get(id)?.name ?? '—';
  }

  getSubjectColor(id: string): string {
    return this.subjectMap.get(id)?.color ?? '#999';
  }

  getTopicName(id: string): string {
    return this.topicMap.get(id)?.name ?? '—';
  }

  truncate(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close({
        ...this.form.value,
        questionIds: Array.from(this.selectedQuestionIds()),
      });
    }
  }
}
