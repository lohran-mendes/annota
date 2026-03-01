import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MOCK_SUBJECTS } from '../../../core/mock-data';
import type { Subject } from '@annota/shared';

@Component({
  selector: 'annota-subject-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './subject-management.html',
  styleUrl: './subject-management.scss',
})
export class SubjectManagement {
  subjects = signal<Subject[]>(MOCK_SUBJECTS);
  displayedColumns = ['color', 'name', 'icon', 'questions', 'actions'];
}
