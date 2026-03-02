import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import type { Exam } from '@annota/shared';

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
  ],
  template: `
    <h2 mat-dialog-title>{{ data.exam ? 'Editar Prova' : 'Nova Prova' }}</h2>
    <mat-dialog-content>
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
          <mat-label>Descrição</mat-label>
          <textarea matInput formControlName="description" rows="3"
                    placeholder="Descreva a prova..."></textarea>
        </mat-form-field>
      </form>
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
      min-width: 400px;
    }

    @media (max-width: 599px) {
      .dialog-form {
        min-width: unset;
      }
    }
  `],
})
export class ExamDialog {
  readonly dialogRef = inject(MatDialogRef<ExamDialog>);
  readonly data = inject<ExamDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    name: [this.data.exam?.name ?? '', Validators.required],
    institution: [this.data.exam?.institution ?? '', Validators.required],
    year: [this.data.exam?.year ?? new Date().getFullYear(), [Validators.required, Validators.min(2000)]],
    description: [this.data.exam?.description ?? '', Validators.required],
  });

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
