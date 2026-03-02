import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SubjectService } from '../../../core/services/subject.service';
import { ExamService } from '../../../core/services/exam.service';
import { SubjectDialog } from '../dialogs/subject-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import { MOCK_SUBJECTS } from '../../../core/mock-data';
import type { Subject, Exam } from '@annota/shared';

@Component({
  selector: 'annota-subject-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './subject-management.html',
  styleUrl: './subject-management.scss',
})
export class SubjectManagement implements OnInit {
  private readonly subjectService = inject(SubjectService);
  private readonly examService = inject(ExamService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  subjects = signal<Subject[]>([]);
  exams = signal<Exam[]>([]);
  loading = signal(false);
  displayedColumns = ['color', 'name', 'icon', 'questions', 'actions'];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    this.examService.getAll().subscribe({
      next: (res) => this.exams.set(res.data),
      error: () => {},
    });
    this.subjectService.getAll().subscribe({
      next: (res) => {
        this.subjects.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.subjects.set(MOCK_SUBJECTS);
        this.loading.set(false);
      },
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(SubjectDialog, { data: { exams: this.exams() } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.subjectService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Matéria criada com sucesso!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao criar matéria.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(subject: Subject) {
    const ref = this.dialog.open(SubjectDialog, { data: { subject, exams: this.exams() } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.subjectService.update(subject.id, result).subscribe({
          next: () => {
            this.snackBar.open('Matéria atualizada!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao atualizar matéria.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  confirmDelete(subject: Subject) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Excluir Matéria', message: `Deseja excluir "${subject.name}"? Esta ação não pode ser desfeita.` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.subjectService.delete(subject.id).subscribe({
          next: () => {
            this.snackBar.open('Matéria excluída!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao excluir matéria.', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
