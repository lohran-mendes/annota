import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MOCK_EXAMS, MOCK_SUBJECTS, MOCK_TOPICS, MOCK_QUESTIONS } from '../../../core/mock-data';

@Component({
  selector: 'annota-admin-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard {
  stats = signal([
    { label: 'Provas', count: MOCK_EXAMS.length, icon: 'school', route: '/admin/exams', color: '#E91E63' },
    { label: 'Matérias', count: MOCK_SUBJECTS.length, icon: 'menu_book', route: '/admin/subjects', color: '#9C27B0' },
    { label: 'Tópicos', count: MOCK_TOPICS.length, icon: 'topic', route: '/admin/topics', color: '#00BCD4' },
    { label: 'Questões', count: MOCK_QUESTIONS.length, icon: 'help_outline', route: '/admin/questions', color: '#FF7043' },
  ]);
}
