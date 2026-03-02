import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import type { Subject, Exam } from '@annota/shared';
import { ExamService } from '../../../core/services/exam.service';

export interface SubjectDialogData {
  subject?: Subject;
  exams?: Exam[];
}

const MATERIAL_ICONS = [
  'calculate', 'menu_book', 'science', 'history_edu', 'public',
  'brush', 'music_note', 'sports_soccer', 'psychology', 'code',
  'language', 'biotech', 'architecture', 'gavel', 'economics',
];

const COLORS = [
  '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
  '#00BCD4', '#009688', '#4CAF50', '#66BB6A', '#FF9800',
  '#FF7043', '#795548', '#607D8B', '#F44336', '#FFEB3B',
];

@Component({
  selector: 'annota-subject-dialog',
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
    <h2 mat-dialog-title>{{ data.subject ? 'Editar Matéria' : 'Nova Matéria' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Prova</mat-label>
          <mat-select formControlName="examId">
            @for (exam of exams; track exam.id) {
              <mat-option [value]="exam.id">{{ exam.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Matemática">
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Ícone (Material Icon)</mat-label>
          <mat-select formControlName="icon">
            @for (icon of icons; track icon) {
              <mat-option [value]="icon">
                <mat-icon>{{ icon }}</mat-icon> {{ icon }}
              </mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Cor</mat-label>
          <mat-select formControlName="color">
            @for (color of colors; track color) {
              <mat-option [value]="color">
                <span class="color-option">
                  <span class="color-swatch" [style.background-color]="color"></span>
                  {{ color }}
                </span>
              </mat-option>
            }
          </mat-select>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.subject ? 'Salvar' : 'Criar' }}
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
    .color-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .color-swatch {
      display: inline-block;
      width: 16px;
      height: 16px;
      border-radius: 50%;
    }
    @media (max-width: 599px) {
      .dialog-form { min-width: unset; }
    }
  `],
})
export class SubjectDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<SubjectDialog>);
  readonly data = inject<SubjectDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly examService = inject(ExamService);

  icons = MATERIAL_ICONS;
  colors = COLORS;
  exams: Exam[] = [];

  form = this.fb.group({
    examId: [this.data.subject?.examId ?? '', Validators.required],
    name: [this.data.subject?.name ?? '', Validators.required],
    icon: [this.data.subject?.icon ?? 'menu_book', Validators.required],
    color: [this.data.subject?.color ?? '#E91E63', Validators.required],
  });

  ngOnInit() {
    if (this.data.exams) {
      this.exams = this.data.exams;
    } else {
      this.examService.getAll().subscribe((res) => {
        this.exams = res.data;
      });
    }

    if (this.data.subject) {
      this.form.get('examId')!.disable();
    }
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
