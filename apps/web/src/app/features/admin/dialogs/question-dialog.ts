import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import type { Question, Subject, Topic } from '@annota/shared';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';

export interface QuestionDialogData {
  question?: Question;
  subjects?: Subject[];
  topics?: Topic[];
}

@Component({
  selector: 'annota-question-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatRadioModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.question ? 'Editar Questão' : 'Nova Questão' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Matéria</mat-label>
          <mat-select formControlName="subjectId" (selectionChange)="onSubjectChange()">
            @for (subject of subjects(); track subject.id) {
              <mat-option [value]="subject.id">{{ subject.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tópico</mat-label>
          <mat-select formControlName="topicId">
            @for (topic of filteredTopics(); track topic.id) {
              <mat-option [value]="topic.id">{{ topic.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Enunciado</mat-label>
          <textarea matInput formControlName="statement" rows="4"
                    placeholder="Digite o enunciado da questão..."></textarea>
        </mat-form-field>

        <div class="alternatives-section">
          <h3>Alternativas</h3>
          @for (alt of alternatives.controls; track $index; let i = $index) {
            <div class="alternative-row">
              <mat-radio-button
                [value]="i"
                [checked]="form.get('correctAnswerIndex')?.value === i"
                (change)="form.patchValue({ correctAnswerIndex: i })">
              </mat-radio-button>
              <span class="alt-label">{{ getLabel(i) }}</span>
              <mat-form-field appearance="outline" class="alt-input">
                <input matInput [formControl]="alt" [placeholder]="'Alternativa ' + getLabel(i)">
              </mat-form-field>
              @if (alternatives.length > 2) {
                <button mat-icon-button color="warn" (click)="removeAlternative(i)" type="button">
                  <mat-icon>close</mat-icon>
                </button>
              }
            </div>
          }
          @if (alternatives.length < 5) {
            <button mat-stroked-button type="button" (click)="addAlternative()">
              <mat-icon>add</mat-icon> Adicionar alternativa
            </button>
          }
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Explicação</mat-label>
          <textarea matInput formControlName="explanation" rows="3"
                    placeholder="Explique a resolução..."></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid || alternatives.length < 2"
              (click)="save()">
        {{ data.question ? 'Salvar' : 'Criar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 500px;
      max-width: 600px;
    }
    .alternatives-section {
      margin: 8px 0;
    }
    .alternatives-section h3 {
      margin: 0 0 8px;
      font-size: 0.95rem;
      font-weight: 600;
    }
    .alternative-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .alt-label {
      font-weight: 600;
      min-width: 20px;
    }
    .alt-input {
      flex: 1;
    }
    @media (max-width: 599px) {
      .dialog-form { min-width: unset; max-width: unset; }
    }
  `],
})
export class QuestionDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<QuestionDialog>);
  readonly data = inject<QuestionDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);

  subjects = signal<Subject[]>([]);
  allTopics = signal<Topic[]>([]);
  filteredTopics = signal<Topic[]>([]);

  alternatives = new FormArray<FormControl<string>>([]);

  form = this.fb.group({
    subjectId: [this.data.question?.subjectId ?? '', Validators.required],
    topicId: [this.data.question?.topicId ?? '', Validators.required],
    statement: [this.data.question?.statement ?? '', Validators.required],
    correctAnswerIndex: [this.data.question?.correctAnswerIndex ?? 0, Validators.required],
    explanation: [this.data.question?.explanation ?? '', Validators.required],
  });

  ngOnInit() {
    // Load subjects
    if (this.data.subjects) {
      this.subjects.set(this.data.subjects);
    } else {
      this.subjectService.getAll().subscribe((res) => this.subjects.set(res.data));
    }

    // Load topics
    if (this.data.topics) {
      this.allTopics.set(this.data.topics);
      this.filterTopics();
    } else {
      this.topicService.getAll().subscribe((res) => {
        this.allTopics.set(res.data);
        this.filterTopics();
      });
    }

    // Initialize alternatives
    if (this.data.question) {
      this.data.question.alternatives.forEach((alt) => {
        this.alternatives.push(new FormControl(alt.text, { nonNullable: true, validators: Validators.required }));
      });
    } else {
      for (let i = 0; i < 4; i++) {
        this.alternatives.push(new FormControl('', { nonNullable: true, validators: Validators.required }));
      }
    }
  }

  onSubjectChange() {
    this.form.patchValue({ topicId: '' });
    this.filterTopics();
  }

  private filterTopics() {
    const subjectId = this.form.get('subjectId')?.value;
    if (subjectId) {
      this.filteredTopics.set(this.allTopics().filter((t) => t.subjectId === subjectId));
    } else {
      this.filteredTopics.set(this.allTopics());
    }
  }

  getLabel(index: number): string {
    return String.fromCharCode(65 + index);
  }

  addAlternative() {
    if (this.alternatives.length < 5) {
      this.alternatives.push(new FormControl('', { nonNullable: true, validators: Validators.required }));
    }
  }

  removeAlternative(index: number) {
    if (this.alternatives.length > 2) {
      this.alternatives.removeAt(index);
      const correctIndex = this.form.get('correctAnswerIndex')?.value ?? 0;
      if (correctIndex >= this.alternatives.length) {
        this.form.patchValue({ correctAnswerIndex: this.alternatives.length - 1 });
      }
    }
  }

  save() {
    if (this.form.valid && this.alternatives.length >= 2) {
      const formValue = this.form.value;
      const alternatives = this.alternatives.controls.map((ctrl, i) => ({
        label: this.getLabel(i),
        text: ctrl.value,
      }));
      this.dialogRef.close({
        ...formValue,
        alternatives,
      });
    }
  }
}
