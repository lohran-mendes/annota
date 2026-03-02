import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { forkJoin } from 'rxjs';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { MOCK_SUBJECTS, MOCK_TOPICS } from '../../../core/mock-data';
import { mergeWithMock } from '../../../core/utils/data-merge';
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
export class StudyDashboard implements OnInit {
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);

  subjects = signal<Subject[]>(MOCK_SUBJECTS);
  topics = signal<Topic[]>(MOCK_TOPICS);
  loading = signal(false);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      subjects: this.subjectService.getAll(),
      topics: this.topicService.getAll(),
    }).subscribe({
      next: ({ subjects, topics }) => {
        this.subjects.set(mergeWithMock(subjects.data, MOCK_SUBJECTS));
        this.topics.set(mergeWithMock(topics.data, MOCK_TOPICS));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

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
