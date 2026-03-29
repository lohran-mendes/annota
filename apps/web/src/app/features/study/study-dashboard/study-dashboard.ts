import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import { ProgressService } from '../../../core/services/progress.service';
import type { Exam, ExamSubject, ExamTopic, ExamProgress, TopicProgress, SubjectProgress } from '@annota/shared';

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
  private readonly progressService = inject(ProgressService);

  examId = '';
  exam = signal<Exam | null>(null);
  subjects = signal<ExamSubject[]>([]);
  loading = signal(true);
  examProgress = signal<ExamProgress | null>(null);

  private subjectProgressMap = computed(() => {
    const map = new Map<string, SubjectProgress>();
    const progress = this.examProgress();
    if (progress) {
      for (const sp of progress.bySubject) {
        map.set(sp.subjectId, sp);
      }
    }
    return map;
  });

  private topicProgressMap = computed(() => {
    const map = new Map<string, TopicProgress>();
    const progress = this.examProgress();
    if (progress?.byTopic) {
      for (const tp of progress.byTopic) {
        map.set(tp.topicId, tp);
      }
    }
    return map;
  });

  ngOnInit() {
    this.examId = this.route.snapshot.params['examId'] ?? '';
    this.loadData();
  }

  loadData() {
    this.loading.set(true);
    forkJoin({
      exam: this.examService.getById(this.examId),
      subjects: this.examService.getExamSubjects(this.examId),
      progress: this.progressService.getExamProgress(this.examId),
    }).subscribe({
      next: ({ exam, subjects, progress }) => {
        this.exam.set(exam.data);
        this.subjects.set(subjects.data);
        this.examProgress.set(progress.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  getSubjectProgress(subject: ExamSubject): number {
    if (subject.questionCount === 0) return 0;
    const sp = this.subjectProgressMap().get(subject.id);
    if (!sp) return 0;
    return Math.round((sp.answered / subject.questionCount) * 100);
  }

  getTopicProgress(topic: ExamTopic): number {
    if (topic.questionCount === 0) return 0;
    const tp = this.topicProgressMap().get(topic.id);
    if (!tp) return 0;
    return Math.round((tp.answered / topic.questionCount) * 100);
  }
}
