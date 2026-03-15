import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ExamService } from '../../../core/services/exam.service';
import { ExamDialog } from '../dialogs/exam-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import type { Exam } from '@annota/shared';

@Component({
  selector: 'annota-exam-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './exam-management.html',
  styleUrl: './exam-management.scss',
})
export class ExamManagement implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  exams = signal<Exam[]>([]);
  loading = signal(false);
  displayedColumns = ['name', 'institution', 'year', 'questions', 'actions'];

  ngOnInit() {
    this.loadExams();
  }

  loadExams() {
    this.loading.set(true);
    this.examService.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(ExamDialog, { data: {} });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.examService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Prova criada com sucesso!', 'OK', { duration: 3000 });
            this.loadExams();
          },
          error: () => this.snackBar.open('Erro ao criar prova.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(exam: Exam) {
    const ref = this.dialog.open(ExamDialog, { data: { exam } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.examService.update(exam.id, result).subscribe({
          next: () => {
            this.snackBar.open('Prova atualizada!', 'OK', { duration: 3000 });
            this.loadExams();
          },
          error: () => this.snackBar.open('Erro ao atualizar prova.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  confirmDelete(exam: Exam) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Excluir Prova', message: `Deseja excluir "${exam.name}"? Esta ação não pode ser desfeita.` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.examService.delete(exam.id).subscribe({
          next: () => {
            this.snackBar.open('Prova excluída!', 'OK', { duration: 3000 });
            this.loadExams();
          },
          error: () => this.snackBar.open('Erro ao excluir prova.', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
