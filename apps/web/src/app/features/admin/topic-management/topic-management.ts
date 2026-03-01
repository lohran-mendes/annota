import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MOCK_TOPICS, MOCK_SUBJECTS } from '../../../core/mock-data';

interface TopicRow {
  id: string;
  name: string;
  subjectName: string;
  questionCount: number;
}

@Component({
  selector: 'annota-topic-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatTableModule],
  templateUrl: './topic-management.html',
  styleUrl: './topic-management.scss',
})
export class TopicManagement {
  displayedColumns = ['name', 'subject', 'questions', 'actions'];

  topics = signal<TopicRow[]>(
    MOCK_TOPICS.map((t) => ({
      id: t.id,
      name: t.name,
      subjectName: MOCK_SUBJECTS.find((s) => s.id === t.subjectId)?.name ?? '—',
      questionCount: t.questionCount,
    })),
  );
}
