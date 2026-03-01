import { Component, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MOCK_QUESTIONS, MOCK_TOPICS, MOCK_SUBJECTS } from '../../../core/mock-data';

interface QuestionRow {
  id: string;
  statement: string;
  topicName: string;
  subjectName: string;
  alternativeCount: number;
}

@Component({
  selector: 'annota-question-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './question-management.html',
  styleUrl: './question-management.scss',
})
export class QuestionManagement {
  questions = signal<QuestionRow[]>(
    MOCK_QUESTIONS.map((q) => {
      const topic = MOCK_TOPICS.find((t) => t.id === q.topicId);
      const subject = MOCK_SUBJECTS.find((s) => s.id === q.subjectId);
      return {
        id: q.id,
        statement: q.statement.length > 100 ? q.statement.substring(0, 100) + '...' : q.statement,
        topicName: topic?.name ?? '—',
        subjectName: subject?.name ?? '—',
        alternativeCount: q.alternatives.length,
      };
    }),
  );
}
