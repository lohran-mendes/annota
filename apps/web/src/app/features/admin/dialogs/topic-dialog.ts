import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { Topic, Subject } from '@annota/shared';
import { SubjectService } from '../../../core/services/subject.service';

export interface TopicDialogData {
  topic?: Topic;
  subjects?: Subject[];
}

@Component({
  selector: 'annota-topic-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.topic ? 'Editar Tópico' : 'Novo Tópico' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="dialog-form">
        <mat-form-field appearance="outline">
          <mat-label>Matéria</mat-label>
          <mat-select formControlName="subjectId">
            @for (subject of subjects; track subject.id) {
              <mat-option [value]="subject.id">{{ subject.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Nome</mat-label>
          <input matInput formControlName="name" placeholder="Ex: Equações do 1º grau">
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">
        {{ data.topic ? 'Salvar' : 'Criar' }}
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
  `],
})
export class TopicDialog implements OnInit {
  readonly dialogRef = inject(MatDialogRef<TopicDialog>);
  readonly data = inject<TopicDialogData>(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);
  private readonly subjectService = inject(SubjectService);

  subjects: Subject[] = [];

  form = this.fb.group({
    subjectId: [this.data.topic?.subjectId ?? '', Validators.required],
    name: [this.data.topic?.name ?? '', Validators.required],
  });

  ngOnInit() {
    if (this.data.subjects) {
      this.subjects = this.data.subjects;
    } else {
      this.subjectService.getAll().subscribe((res) => {
        this.subjects = res.data;
      });
    }

    if (this.data.topic) {
      this.form.get('subjectId')!.disable();
    }
  }

  save() {
    if (this.form.valid) {
      this.dialogRef.close(this.form.getRawValue());
    }
  }
}
