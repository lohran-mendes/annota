import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MOCK_EXAMS } from '../../../core/mock-data';
import type { Exam } from '@annota/shared';

@Component({
  selector: 'annota-exam-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './exam-management.html',
  styleUrl: './exam-management.scss',
})
export class ExamManagement {
  exams = signal<Exam[]>(MOCK_EXAMS);
  displayedColumns = ['name', 'institution', 'year', 'questions', 'actions'];
}
