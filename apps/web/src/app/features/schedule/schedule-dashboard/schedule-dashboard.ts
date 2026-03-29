import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { ExamService } from '../../../core/services/exam.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ActivityDialog } from '../activity-dialog';
import type { ScheduleActivity } from '../activity-dialog';
import type { Exam, ExamSubject, ScheduleWeek } from '@annota/shared';

export type { ScheduleActivity };

interface ScheduleDay {
  dayOfWeek: string;
  activities: ScheduleActivity[];
}

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

@Component({
  selector: 'annota-schedule-dashboard',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
  ],
  templateUrl: './schedule-dashboard.html',
  styleUrl: './schedule-dashboard.scss',
})
export class ScheduleDashboard implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly dialog = inject(MatDialog);

  exams = signal<Exam[]>([]);
  selectedExamId = signal<string | null>(null);
  schedule = signal<ScheduleWeek[]>([]);
  loading = signal(true);
  loadingSchedule = signal(false);
  error = signal(false);
  editing = signal(false);
  hasCustomSchedule = signal(false);

  selectedExam = computed(() =>
    this.exams().find((e) => e.id === this.selectedExamId()) ?? null,
  );

  private subjectNames: string[] = [];

  ngOnInit(): void {
    this.loadExams();
  }

  selectExam(examId: string): void {
    if (this.selectedExamId() === examId) return;
    this.editing.set(false);
    this.selectedExamId.set(examId);
    this.loadScheduleForExam(examId);
  }

  reload(): void {
    this.error.set(false);
    this.loadExams();
  }

  toggleEditing(): void {
    this.editing.update((v) => !v);
  }

  // ── Activity CRUD ──────────────────────────────────────────────────────────

  openActivityDialog(weekIndex: number, dayIndex: number, activityIndex?: number): void {
    const week = this.schedule()[weekIndex];
    const day = week.days[dayIndex];
    const existingActivity = activityIndex !== undefined ? day.activities[activityIndex] : undefined;

    const dialogRef = this.dialog.open(ActivityDialog, {
      data: {
        activity: existingActivity,
        subjects: this.subjectNames,
      },
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result: ScheduleActivity | undefined) => {
      if (!result) return;

      const updated = structuredClone(this.schedule());
      if (activityIndex !== undefined) {
        updated[weekIndex].days[dayIndex].activities[activityIndex] = result;
      } else {
        updated[weekIndex].days[dayIndex].activities.push(result);
      }
      this.schedule.set(updated);
      this.saveToApi();
    });
  }

  removeActivity(weekIndex: number, dayIndex: number, activityIndex: number): void {
    const updated = structuredClone(this.schedule());
    updated[weekIndex].days[dayIndex].activities.splice(activityIndex, 1);
    this.schedule.set(updated);
    this.saveToApi();
  }

  resetSchedule(): void {
    const examId = this.selectedExamId();
    if (!examId) return;

    this.scheduleService.delete(examId).subscribe({
      next: () => {
        this.hasCustomSchedule.set(false);
        this.editing.set(false);
        this.loadScheduleForExam(examId);
      },
      error: () => {
        this.hasCustomSchedule.set(false);
        this.editing.set(false);
        this.loadScheduleForExam(examId);
      },
    });
  }

  // ── API persistence ────────────────────────────────────────────────────────

  private saveToApi(): void {
    const examId = this.selectedExamId();
    if (!examId) return;

    this.scheduleService.save({ examId, weeks: this.schedule() }).subscribe({
      next: () => this.hasCustomSchedule.set(true),
    });
  }

  // ── Data loading ───────────────────────────────────────────────────────────

  private loadExams(): void {
    this.loading.set(true);
    this.examService.getAll().subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.loading.set(false);
        if (res.data.length > 0) {
          this.selectExam(res.data[0].id);
        }
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private loadScheduleForExam(examId: string): void {
    this.loadingSchedule.set(true);
    this.schedule.set([]);

    this.scheduleService.getByExam(examId).subscribe({
      next: (res) => {
        if (res.data) {
          this.schedule.set(res.data.weeks);
          this.hasCustomSchedule.set(true);
          this.loadSubjectNames(examId);
          this.loadingSchedule.set(false);
        } else {
          this.hasCustomSchedule.set(false);
          this.generateFromApi(examId);
        }
      },
      error: () => {
        this.hasCustomSchedule.set(false);
        this.generateFromApi(examId);
      },
    });
  }

  private generateFromApi(examId: string): void {
    this.examService.getExamSubjects(examId).subscribe({
      next: (res) => {
        this.subjectNames = res.data.map((s) => s.name);
        const generated = this.generateSchedule(res.data);
        this.schedule.set(generated);
        this.loadingSchedule.set(false);
      },
      error: () => {
        const exam = this.exams().find((e) => e.id === examId);
        const fallback = this.generateFallbackSchedule(exam);
        this.schedule.set(fallback);
        this.loadingSchedule.set(false);
      },
    });
  }

  private loadSubjectNames(examId: string): void {
    this.examService.getExamSubjects(examId).subscribe({
      next: (res) => {
        this.subjectNames = res.data.map((s) => s.name);
      },
      error: () => {
        this.subjectNames = ['Matemática', 'Português', 'Ciências', 'História'];
      },
    });
  }

  // ── Schedule generation ────────────────────────────────────────────────────

  generateSchedule(subjects: ExamSubject[]): ScheduleWeek[] {
    const totalWeeks = subjects.length <= 3 ? 4 : subjects.length <= 6 ? 6 : 8;
    const weeks: ScheduleWeek[] = [];

    const subjectNames = subjects.map((s) => s.name);
    this.subjectNames = subjectNames;
    const coreSubjects = subjectNames.slice(0, 2);
    const remainingSubjects = subjectNames.slice(2);

    for (let w = 1; w <= totalWeeks; w++) {
      const days: ScheduleDay[] = WEEKDAYS.map((day) => ({
        dayOfWeek: day,
        activities: this.buildActivitiesForDay(
          w,
          totalWeeks,
          day,
          coreSubjects,
          remainingSubjects,
          subjectNames,
        ),
      }));

      weeks.push({
        weekNumber: w,
        label: this.weekLabel(w, totalWeeks),
        days,
      });
    }

    return weeks;
  }

  private generateFallbackSchedule(exam: Exam | undefined): ScheduleWeek[] {
    const fallbackSubjects: ExamSubject[] = [
      { id: '1', name: 'Matemática', icon: 'calculate', color: '#e91e63', questionCount: 0, topics: [] },
      { id: '2', name: 'Português', icon: 'menu_book', color: '#9c27b0', questionCount: 0, topics: [] },
      { id: '3', name: 'Ciências', icon: 'science', color: '#2196f3', questionCount: 0, topics: [] },
      { id: '4', name: 'História', icon: 'history_edu', color: '#ff9800', questionCount: 0, topics: [] },
    ];
    return this.generateSchedule(fallbackSubjects);
  }

  private buildActivitiesForDay(
    week: number,
    totalWeeks: number,
    day: string,
    coreSubjects: string[],
    remainingSubjects: string[],
    allSubjects: string[],
  ): ScheduleActivity[] {
    const isSaturday = day === 'Sábado';
    const phase = this.getPhase(week, totalWeeks);

    if (phase === 'mock') {
      if (isSaturday) {
        return [{ subject: 'Simulado Completo', description: 'Realize um simulado completo para medir sua preparação', type: 'mock-exam', duration: 180 }];
      }
      const subj = allSubjects[(week + WEEKDAYS.indexOf(day)) % allSubjects.length] ?? allSubjects[0];
      return [{ subject: subj, description: 'Revisão final e resolução de questões', type: 'review', duration: 40 }];
    }

    if (phase === 'practice') {
      const subj = allSubjects[(WEEKDAYS.indexOf(day)) % allSubjects.length] ?? allSubjects[0];
      if (isSaturday) {
        return [
          { subject: subj, description: 'Exercícios de fixação', type: 'practice', duration: 60 },
          { subject: allSubjects[(WEEKDAYS.indexOf(day) + 1) % allSubjects.length] ?? allSubjects[0], description: 'Revisão dos principais tópicos', type: 'review', duration: 30 },
        ];
      }
      return [{ subject: subj, description: 'Resolução de exercícios práticos', type: 'practice', duration: 45 }];
    }

    if (phase === 'science') {
      const subj = remainingSubjects.length > 0
        ? remainingSubjects[(WEEKDAYS.indexOf(day)) % remainingSubjects.length]
        : allSubjects[(WEEKDAYS.indexOf(day)) % allSubjects.length];
      if (isSaturday) {
        return [
          { subject: subj ?? allSubjects[0], description: 'Revisão da semana', type: 'review', duration: 60 },
          { subject: coreSubjects[0] ?? allSubjects[0], description: 'Exercícios de reforço', type: 'practice', duration: 30 },
        ];
      }
      return [{ subject: subj ?? allSubjects[0], description: 'Estudo dos principais conceitos', type: 'study', duration: 50 }];
    }

    // core phase
    const subj = coreSubjects.length > 0
      ? coreSubjects[WEEKDAYS.indexOf(day) % coreSubjects.length]
      : allSubjects[0];
    if (isSaturday) {
      return [
        { subject: subj ?? allSubjects[0], description: 'Exercícios práticos de fixação', type: 'practice', duration: 60 },
        { subject: coreSubjects[1] ?? coreSubjects[0] ?? allSubjects[0], description: 'Revisão dos conteúdos da semana', type: 'review', duration: 30 },
      ];
    }
    return [{ subject: subj ?? allSubjects[0], description: 'Estudo dos fundamentos e teoria', type: 'study', duration: 45 }];
  }

  private getPhase(week: number, totalWeeks: number): 'core' | 'science' | 'practice' | 'mock' {
    const ratio = week / totalWeeks;
    if (ratio <= 0.25) return 'core';
    if (ratio <= 0.5) return 'science';
    if (ratio <= 0.75) return 'practice';
    return 'mock';
  }

  private weekLabel(week: number, totalWeeks: number): string {
    const phase = this.getPhase(week, totalWeeks);
    const phaseLabels: Record<string, string> = {
      core: 'Fundamentos',
      science: 'Aprofundamento',
      practice: 'Prática intensiva',
      mock: 'Simulados e revisão final',
    };
    return `Semana ${week} — ${phaseLabels[phase]}`;
  }

  // ── Display helpers ────────────────────────────────────────────────────────

  getActivityIcon(type: ScheduleActivity['type']): string {
    const icons: Record<string, string> = {
      study: 'auto_stories',
      review: 'refresh',
      practice: 'edit_note',
      'mock-exam': 'timer',
    };
    return icons[type] ?? 'school';
  }

  getActivityTypeLabel(type: ScheduleActivity['type']): string {
    const labels: Record<string, string> = {
      study: 'Estudo',
      review: 'Revisão',
      practice: 'Prática',
      'mock-exam': 'Simulado',
    };
    return labels[type] ?? type;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }
}
