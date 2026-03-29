import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface ScheduleActivity {
  subject: string;
  description: string;
  type: 'study' | 'review' | 'practice' | 'mock-exam';
  duration: number;
}

export interface ActivityDialogData {
  activity?: ScheduleActivity;
  subjects: string[];
}

@Component({
  selector: 'annota-activity-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.activity ? 'Editar Atividade' : 'Nova Atividade' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Matéria</mat-label>
          <mat-select formControlName="subject">
            @for (subj of data.subjects; track subj) {
              <mat-option [value]="subj">{{ subj }}</mat-option>
            }
            <mat-option value="__custom">Outro (personalizado)</mat-option>
          </mat-select>
        </mat-form-field>

        @if (form.get('subject')?.value === '__custom') {
          <mat-form-field appearance="outline">
            <mat-label>Nome da matéria</mat-label>
            <input matInput formControlName="customSubject" placeholder="Ex: Redação">
          </mat-form-field>
        }

        <mat-form-field appearance="outline">
          <mat-label>Descrição</mat-label>
          <input matInput formControlName="description" placeholder="Ex: Estudo dos fundamentos">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Tipo de atividade</mat-label>
          <mat-select formControlName="type">
            <mat-option value="study">
              <mat-icon class="option-icon type-study">auto_stories</mat-icon>
              Estudo
            </mat-option>
            <mat-option value="review">
              <mat-icon class="option-icon type-review">refresh</mat-icon>
              Revisão
            </mat-option>
            <mat-option value="practice">
              <mat-icon class="option-icon type-practice">edit_note</mat-icon>
              Prática
            </mat-option>
            <mat-option value="mock-exam">
              <mat-icon class="option-icon type-mock-exam">timer</mat-icon>
              Simulado
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Duração (minutos)</mat-label>
          <input matInput type="number" formControlName="duration" min="5" max="480" placeholder="45">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.activity ? 'Salvar' : 'Adicionar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 400px;
    }
    @media (max-width: 599px) {
      .dialog-form { min-width: unset; }
    }
    .option-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      vertical-align: middle;
      margin-right: 6px;
    }
    .type-study { color: var(--annota-pink-500); }
    .type-review { color: var(--annota-violet-500); }
    .type-practice { color: #4caf50; }
    .type-mock-exam { color: var(--annota-coral); }
  `],
})
export class ActivityDialog {
  readonly dialogRef = inject(MatDialogRef<ActivityDialog>);
  readonly data = inject<ActivityDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    subject: [this.data.activity?.subject ?? '', Validators.required],
    customSubject: [''],
    description: [this.data.activity?.description ?? '', Validators.required],
    type: [this.data.activity?.type ?? 'study', Validators.required],
    duration: [this.data.activity?.duration ?? 45, [Validators.required, Validators.min(5), Validators.max(480)]],
  });

  constructor() {
    if (this.data.activity && !this.data.subjects.includes(this.data.activity.subject)) {
      this.form.patchValue({ subject: '__custom', customSubject: this.data.activity.subject });
    }
  }

  save() {
    if (this.form.invalid) return;

    const val = this.form.getRawValue();
    const subject = val.subject === '__custom' ? (val.customSubject || '').trim() : val.subject;

    if (!subject) return;

    const result: ScheduleActivity = {
      subject,
      description: val.description ?? '',
      type: (val.type ?? 'study') as ScheduleActivity['type'],
      duration: val.duration ?? 45,
    };
    this.dialogRef.close(result);
  }
}
