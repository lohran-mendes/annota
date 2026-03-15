import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import type { CreateExamDto } from '@annota/shared';

@Component({
  selector: 'annota-create-exam-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>
      <mat-icon>add_circle</mat-icon>
      Nova prova
    </h2>

    <mat-dialog-content>
      <form [formGroup]="form" class="exam-form">
        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Nome da prova</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Vestibulinho ETEC 2025" />
          @if (form.get('name')?.hasError('required') && form.get('name')?.touched) {
            <mat-error>Nome é obrigatório</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Instituição</mat-label>
          <input matInput formControlName="institution" placeholder="Ex: ETEC" />
          @if (form.get('institution')?.hasError('required') && form.get('institution')?.touched) {
            <mat-error>Instituição é obrigatória</mat-error>
          }
        </mat-form-field>

        <div class="row-fields">
          <mat-form-field appearance="outline">
            <mat-label>Ano</mat-label>
            <input matInput type="number" formControlName="year" placeholder="Ex: 2025" />
            @if (form.get('year')?.hasError('required') && form.get('year')?.touched) {
              <mat-error>Ano é obrigatório</mat-error>
            }
            @if (form.get('year')?.hasError('min') && form.get('year')?.touched) {
              <mat-error>Ano inválido</mat-error>
            }
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Duração (minutos)</mat-label>
            <input matInput type="number" formControlName="duration" placeholder="Ex: 180" />
            <mat-hint>Tempo total em minutos</mat-hint>
            @if (form.get('duration')?.hasError('required') && form.get('duration')?.touched) {
              <mat-error>Duração é obrigatória</mat-error>
            }
            @if (form.get('duration')?.hasError('min') && form.get('duration')?.touched) {
              <mat-error>Duração deve ser maior que zero</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" class="full-width">
          <mat-label>Descrição</mat-label>
          <textarea
            matInput
            formControlName="description"
            rows="3"
            placeholder="Breve descrição da prova"
          ></textarea>
          @if (form.get('description')?.hasError('required') && form.get('description')?.touched) {
            <mat-error>Descrição é obrigatória</mat-error>
          }
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Cancelar</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="form.invalid">
        <mat-icon>save</mat-icon>
        Criar prova
      </button>
    </mat-dialog-actions>
  `,
  styles: `
    h2[mat-dialog-title] {
      display: flex;
      align-items: center;
      gap: 8px;

      mat-icon {
        color: var(--annota-pink-500);
      }
    }

    mat-dialog-content {
      min-width: 400px;
      padding-top: 8px !important;
    }

    .exam-form {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .full-width {
      width: 100%;
    }

    .row-fields {
      display: flex;
      gap: 16px;

      mat-form-field {
        flex: 1;
      }
    }

    mat-dialog-actions {
      gap: 8px;
      padding-bottom: 16px;
    }

    @media (max-width: 480px) {
      mat-dialog-content {
        min-width: unset;
        width: 100%;
      }

      .row-fields {
        flex-direction: column;
        gap: 4px;
      }
    }
  `,
})
export class CreateExamDialog {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateExamDialog>);

  readonly form = this.fb.group({
    name: ['', Validators.required],
    institution: ['', Validators.required],
    year: [new Date().getFullYear(), [Validators.required, Validators.min(1900)]],
    duration: [180, [Validators.required, Validators.min(1)]],
    description: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const dto: CreateExamDto = {
      name: value.name!,
      institution: value.institution!,
      year: value.year!,
      duration: value.duration!,
      description: value.description!,
    };

    this.dialogRef.close(dto);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
