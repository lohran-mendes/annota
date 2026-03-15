import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import type { Exam, ExamSubject, ExamTopic } from '@annota/shared';

@Component({
  selector: 'annota-study-dashboard',
  imports: [
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './study-dashboard.html',
  styleUrl: './study-dashboard.scss',
})
export class StudyDashboard implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly examService = inject(ExamService);

  examId = '';
  exam = signal<Exam | null>(null);
  subjects = signal<ExamSubject[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.examId = this.route.snapshot.params['examId'] ?? '';
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      exam: this.examService.getById(this.examId),
      subjects: this.examService.getExamSubjects(this.examId),
    }).subscribe({
      next: ({ exam, subjects }) => {
        this.exam.set(exam.data);
        this.subjects.set(subjects.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getSubjectProgress(subject: ExamSubject): number {
    return subject.questionCount > 0
      ? Math.round((subject.questionCount / subject.questionCount) * 100)
      : 0;
  }

  getTopicProgress(topic: ExamTopic): number {
    return topic.questionCount > 0 ? 100 : 0;
  }
}
