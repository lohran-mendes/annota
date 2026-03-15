import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { ExamService } from '../../../core/services/exam.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicService } from '../../../core/services/topic.service';
import { QuestionService } from '../../../core/services/question.service';
import { MockExamService } from '../../../core/services/mock-exam.service';

@Component({
  selector: 'annota-admin-dashboard',
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly subjectService = inject(SubjectService);
  private readonly topicService = inject(TopicService);
  private readonly questionService = inject(QuestionService);
  private readonly mockExamService = inject(MockExamService);

  loading = signal(true);
  stats = signal([
    { label: 'Provas', count: 0, icon: 'school', route: '/admin/exams', color: '#E91E63' },
    { label: 'Matérias', count: 0, icon: 'menu_book', route: '/admin/subjects', color: '#9C27B0' },
    { label: 'Tópicos', count: 0, icon: 'topic', route: '/admin/topics', color: '#00BCD4' },
    { label: 'Questões', count: 0, icon: 'help_outline', route: '/admin/questions', color: '#FF7043' },
    { label: 'Simulados', count: 0, icon: 'assignment', route: '/admin/mock-exams', color: '#4CAF50' },
  ]);

  ngOnInit() {
    forkJoin({
      exams: this.examService.getAll(),
      subjects: this.subjectService.getAll(),
      topics: this.topicService.getAll(),
      questions: this.questionService.getAll(),
      mockExams: this.mockExamService.getAll(),
    }).subscribe({
      next: ({ exams, subjects, topics, questions, mockExams }) => {
        this.stats.set([
          { label: 'Provas', count: exams.total, icon: 'school', route: '/admin/exams', color: '#E91E63' },
          { label: 'Matérias', count: subjects.total, icon: 'menu_book', route: '/admin/subjects', color: '#9C27B0' },
          { label: 'Tópicos', count: topics.total, icon: 'topic', route: '/admin/topics', color: '#00BCD4' },
          { label: 'Questões', count: questions.total, icon: 'help_outline', route: '/admin/questions', color: '#FF7043' },
          { label: 'Simulados', count: mockExams.total, icon: 'assignment', route: '/admin/mock-exams', color: '#4CAF50' },
        ]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
