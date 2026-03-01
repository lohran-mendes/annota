import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MOCK_SUBJECTS, MOCK_TOPICS } from '../../../core/mock-data';
import type { Subject, Topic } from '@annota/shared';

@Component({
  selector: 'annota-study-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
  ],
  templateUrl: './study-dashboard.html',
  styleUrl: './study-dashboard.scss',
})
export class StudyDashboard {
  subjects = signal<Subject[]>(MOCK_SUBJECTS);
  topics = signal<Topic[]>(MOCK_TOPICS);

  getTopicsForSubject(subjectId: string): Topic[] {
    return this.topics().filter((t) => t.subjectId === subjectId);
  }

  getSubjectProgress(subject: Subject): number {
    return subject.questionCount > 0
      ? Math.round((subject.completedCount / subject.questionCount) * 100)
      : 0;
  }

  getTopicProgress(topic: Topic): number {
    return topic.questionCount > 0
      ? Math.round((topic.completedCount / topic.questionCount) * 100)
      : 0;
  }
}
