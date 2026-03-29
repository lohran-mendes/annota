import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamService } from '../../../core/services/exam.service';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ConfirmDialog } from '../../admin/dialogs/confirm-dialog';
import { ActivityDialog } from '../activity-dialog';
import { WeekDialog } from '../week-dialog';
import type { ScheduleActivity } from '../activity-dialog';
import type { Exam, ScheduleWeek } from '@annota/shared';

export type { ScheduleActivity };

interface ScheduleDay {
  dayOfWeek: string;
  activities: ScheduleActivity[];
}

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

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
    MatButtonToggleModule,
  ],
  templateUrl: './schedule-dashboard.html',
  styleUrl: './schedule-dashboard.scss',
})
export class ScheduleDashboard implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly scheduleService = inject(ScheduleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  exams = signal<Exam[]>([]);
  selectedExamId = signal<string | null>(null);
  schedule = signal<ScheduleWeek[]>([]);
  loading = signal(true);
  loadingSchedule = signal(false);
  error = signal(false);
  editing = signal(false);
  hasCustomSchedule = signal(false);
  viewMode = signal<'week' | 'month'>('week');
  expandedWeekIndex = signal<number | null>(0);

  selectedExam = computed(() =>
    this.exams().find((e) => e.id === this.selectedExamId()) ?? null,
  );

  monthGroups = computed(() => {
    const weeks = this.schedule();
    const groups: { label: string; weeks: ScheduleWeek[] }[] = [];
    for (let i = 0; i < weeks.length; i += 4) {
      groups.push({
        label: `Mês ${groups.length + 1}`,
        weeks: weeks.slice(i, i + 4),
      });
    }
    return groups;
  });

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

  // ── Week CRUD ──────────────────────────────────────────────────────────────

  addWeek(): void {
    const dialogRef = this.dialog.open(WeekDialog, {
      data: {},
      width: '440px',
    });

    dialogRef.afterClosed().subscribe((label: string | undefined) => {
      if (!label) return;

      const updated = structuredClone(this.schedule());
      const newWeek: ScheduleWeek = {
        weekNumber: updated.length + 1,
        label,
        days: WEEKDAYS.map((day) => ({ dayOfWeek: day, activities: [] })),
      };
      updated.push(newWeek);
      this.schedule.set(updated);
      this.expandedWeekIndex.set(updated.length - 1);
      this.saveToApi();
    });
  }

  editWeekLabel(weekIndex: number): void {
    const week = this.schedule()[weekIndex];
    const dialogRef = this.dialog.open(WeekDialog, {
      data: { label: week.label },
      width: '440px',
    });

    dialogRef.afterClosed().subscribe((label: string | undefined) => {
      if (!label) return;
      const updated = structuredClone(this.schedule());
      updated[weekIndex].label = label;
      this.schedule.set(updated);
      this.saveToApi();
    });
  }

  removeWeek(weekIndex: number): void {
    const week = this.schedule()[weekIndex];
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Excluir semana',
        message: `Tem certeza que deseja excluir "${week.label}"? Todas as atividades desta semana serão perdidas.`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      const updated = structuredClone(this.schedule());
      updated.splice(weekIndex, 1);
      updated.forEach((w, i) => (w.weekNumber = i + 1));
      this.schedule.set(updated);
      this.saveToApi();
      this.snackBar.open('Semana excluída com sucesso', 'OK', { duration: 3000 });
    });
  }

  goToWeek(weekNumber: number): void {
    this.viewMode.set('week');
    this.expandedWeekIndex.set(weekNumber - 1);
  }

  // ── Activity CRUD ──────────────────────────────────────────────────────────

  openActivityDialog(weekIndex: number, dayIndex: number, activityIndex?: number): void {
    const week = this.schedule()[weekIndex];
    const day = week.days[dayIndex];
    const existingActivity = activityIndex !== undefined ? day.activities[activityIndex] : undefined;

    const dialogRef = this.dialog.open(ActivityDialog, {
      data: {
        activity: existingActivity,
        subjects: this.collectSubjects(),
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

  // ── API persistence ────────────────────────────────────────────────────────

  private saveToApi(): void {
    const examId = this.selectedExamId();
    if (!examId) return;

    const weeks = this.stripMongoIds(this.schedule());
    this.scheduleService.save({ examId, weeks }).subscribe({
      next: () => this.hasCustomSchedule.set(true),
    });
  }

  private stripMongoIds(weeks: ScheduleWeek[]): ScheduleWeek[] {
    return weeks.map((w) => ({
      weekNumber: w.weekNumber,
      label: w.label,
      days: w.days.map((d) => ({
        dayOfWeek: d.dayOfWeek,
        activities: d.activities.map((a) => ({
          subject: a.subject,
          description: a.description,
          type: a.type,
          duration: a.duration,
        })),
      })),
    }));
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
          this.schedule.set(this.normalizeWeeks(res.data.weeks));
          this.hasCustomSchedule.set(true);
        } else {
          this.schedule.set([]);
          this.hasCustomSchedule.set(false);
        }
        this.expandedWeekIndex.set(0);
        this.loadingSchedule.set(false);
      },
      error: () => {
        this.schedule.set([]);
        this.hasCustomSchedule.set(false);
        this.loadingSchedule.set(false);
      },
    });
  }

  private normalizeWeeks(weeks: ScheduleWeek[]): ScheduleWeek[] {
    return weeks.map((week) => {
      const existingDays = new Map(week.days.map((d) => [d.dayOfWeek, d]));
      const days = WEEKDAYS.map((day) => existingDays.get(day) ?? { dayOfWeek: day, activities: [] });
      return { ...week, days };
    });
  }

  private collectSubjects(): string[] {
    const set = new Set<string>();
    for (const week of this.schedule()) {
      for (const day of week.days) {
        for (const activity of day.activities) {
          set.add(activity.subject);
        }
      }
    }
    return Array.from(set);
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

  getDayActivityCount(day: ScheduleDay): number {
    return day.activities.length;
  }
}
