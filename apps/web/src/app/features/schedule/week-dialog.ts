import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

export interface WeekDialogData {
  label?: string;
}

@Component({
  selector: 'annota-week-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.label ? 'Renomear Semana' : 'Nova Semana' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Título da semana</mat-label>
          <input
            matInput
            formControlName="label"
            placeholder="Ex: Fundamentos de Matemática"
            (keydown.enter)="save()"
          >
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.label ? 'Salvar' : 'Criar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-form {
      display: flex;
      flex-direction: column;
      min-width: 360px;
    }
    @media (max-width: 599px) {
      .dialog-form { min-width: unset; }
    }
  `],
})
export class WeekDialog {
  readonly dialogRef = inject(MatDialogRef<WeekDialog>);
  readonly data = inject<WeekDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  form = this.fb.group({
    label: [this.data.label ?? '', [Validators.required, Validators.maxLength(100)]],
  });

  save() {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value.label?.trim());
  }
}
