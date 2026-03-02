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
import { MOCK_EXAMS, MOCK_SUBJECTS, MOCK_TOPICS, MOCK_QUESTIONS } from '../../../core/mock-data';

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

  stats = signal([
    { label: 'Provas', count: MOCK_EXAMS.length, icon: 'school', route: '/admin/exams', color: '#E91E63' },
    { label: 'Matérias', count: MOCK_SUBJECTS.length, icon: 'menu_book', route: '/admin/subjects', color: '#9C27B0' },
    { label: 'Tópicos', count: MOCK_TOPICS.length, icon: 'topic', route: '/admin/topics', color: '#00BCD4' },
    { label: 'Questões', count: MOCK_QUESTIONS.length, icon: 'help_outline', route: '/admin/questions', color: '#FF7043' },
  ]);

  ngOnInit() {
    forkJoin({
      exams: this.examService.getAll(),
      subjects: this.subjectService.getAll(),
      topics: this.topicService.getAll(),
      questions: this.questionService.getAll(),
    }).subscribe({
      next: ({ exams, subjects, topics, questions }) => {
        this.stats.set([
          { label: 'Provas', count: exams.total, icon: 'school', route: '/admin/exams', color: '#E91E63' },
          { label: 'Matérias', count: subjects.total, icon: 'menu_book', route: '/admin/subjects', color: '#9C27B0' },
          { label: 'Tópicos', count: topics.total, icon: 'topic', route: '/admin/topics', color: '#00BCD4' },
          { label: 'Questões', count: questions.total, icon: 'help_outline', route: '/admin/questions', color: '#FF7043' },
        ]);
      },
    });
  }
}
