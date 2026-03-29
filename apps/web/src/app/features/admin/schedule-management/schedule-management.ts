import { Component, inject, signal, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DatePipe } from '@angular/common';
import { ScheduleService } from '../../../core/services/schedule.service';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import { ActivityDialog } from '../../schedule/activity-dialog';
import { WeekDialog } from '../../schedule/week-dialog';
import type { ScheduleActivity } from '../../schedule/activity-dialog';
import type { UserScheduleSummary, ScheduleWeek } from '@annota/shared';

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

@Component({
  selector: 'annota-schedule-management',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatChipsModule,
    MatTooltipModule,
    DatePipe,
  ],
  templateUrl: './schedule-management.html',
  styleUrl: './schedule-management.scss',
})
export class ScheduleManagement implements OnInit {
  private readonly scheduleService = inject(ScheduleService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  users = signal<UserScheduleSummary[]>([]);
  loading = signal(true);

  // Active schedule view
  activeUserId = signal<string | null>(null);
  activeUserName = signal('');
  activeExamId = signal<string | null>(null);
  activeExamName = signal('');
  activeSchedule = signal<ScheduleWeek[]>([]);
  loadingSchedule = signal(false);
  editing = signal(false);

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.scheduleService.adminListUsers().subscribe({
      next: (res) => {
        this.users.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openSchedule(user: UserScheduleSummary, schedule: UserScheduleSummary['schedules'][0]): void {
    this.activeUserId.set(user.userId);
    this.activeUserName.set(user.userName);
    this.activeExamId.set(schedule.examId);
    this.activeExamName.set(schedule.examName);
    this.editing.set(false);
    this.loadScheduleDetail(user.userId, schedule.examId);
  }

  closeSchedule(): void {
    this.activeUserId.set(null);
    this.activeExamId.set(null);
    this.activeSchedule.set([]);
    this.editing.set(false);
  }

  toggleEditing(): void {
    this.editing.update((v) => !v);
  }

  // ── Week CRUD ─────────────────────────────────────────────────────────────

  addWeek(): void {
    const dialogRef = this.dialog.open(WeekDialog, {
      data: {},
      width: '440px',
    });

    dialogRef.afterClosed().subscribe((label: string | undefined) => {
      if (!label) return;
      const updated = structuredClone(this.activeSchedule());
      const newWeek: ScheduleWeek = {
        weekNumber: updated.length + 1,
        label,
        days: WEEKDAYS.map((day) => ({ dayOfWeek: day, activities: [] })),
      };
      updated.push(newWeek);
      this.activeSchedule.set(updated);
      this.saveSchedule();
    });
  }

  editWeekLabel(weekIndex: number): void {
    const week = this.activeSchedule()[weekIndex];
    const dialogRef = this.dialog.open(WeekDialog, {
      data: { label: week.label },
      width: '440px',
    });

    dialogRef.afterClosed().subscribe((label: string | undefined) => {
      if (!label) return;
      const updated = structuredClone(this.activeSchedule());
      updated[weekIndex].label = label;
      this.activeSchedule.set(updated);
      this.saveSchedule();
    });
  }

  removeWeek(weekIndex: number): void {
    const updated = structuredClone(this.activeSchedule());
    updated.splice(weekIndex, 1);
    updated.forEach((w, i) => (w.weekNumber = i + 1));
    this.activeSchedule.set(updated);
    this.saveSchedule();
  }

  // ── Activity CRUD (admin editing) ──────────────────────────────────────────

  openActivityDialog(weekIndex: number, dayIndex: number, activityIndex?: number): void {
    const week = this.activeSchedule()[weekIndex];
    const day = week.days[dayIndex];
    const existing = activityIndex !== undefined ? day.activities[activityIndex] : undefined;

    const dialogRef = this.dialog.open(ActivityDialog, {
      data: { activity: existing, subjects: this.collectSubjects() },
      width: '480px',
    });

    dialogRef.afterClosed().subscribe((result: ScheduleActivity | undefined) => {
      if (!result) return;
      const updated = structuredClone(this.activeSchedule());
      if (activityIndex !== undefined) {
        updated[weekIndex].days[dayIndex].activities[activityIndex] = result;
      } else {
        updated[weekIndex].days[dayIndex].activities.push(result);
      }
      this.activeSchedule.set(updated);
      this.saveSchedule();
    });
  }

  removeActivity(weekIndex: number, dayIndex: number, activityIndex: number): void {
    const updated = structuredClone(this.activeSchedule());
    updated[weekIndex].days[dayIndex].activities.splice(activityIndex, 1);
    this.activeSchedule.set(updated);
    this.saveSchedule();
  }

  deleteSchedule(): void {
    const userId = this.activeUserId();
    const examId = this.activeExamId();
    if (!userId || !examId) return;

    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: {
        title: 'Excluir cronograma',
        message: `Tem certeza que deseja excluir o cronograma de ${this.activeUserName()} para ${this.activeExamName()}?`,
      },
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (!confirmed) return;
      this.scheduleService.adminDeleteSchedule(userId, examId).subscribe({
        next: () => {
          this.snackBar.open('Cronograma excluído', 'OK', { duration: 3000 });
          this.closeSchedule();
          this.loadUsers();
        },
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  getActivityIcon(type: string): string {
    const icons: Record<string, string> = {
      study: 'auto_stories', review: 'refresh',
      practice: 'edit_note', 'mock-exam': 'timer',
    };
    return icons[type] ?? 'school';
  }

  getActivityTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      study: 'Estudo', review: 'Revisão',
      practice: 'Prática', 'mock-exam': 'Simulado',
    };
    return labels[type] ?? type;
  }

  formatDuration(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private loadScheduleDetail(userId: string, examId: string): void {
    this.loadingSchedule.set(true);
    this.scheduleService.adminGetSchedule(userId, examId).subscribe({
      next: (res) => {
        this.activeSchedule.set(this.normalizeWeeks(res.data?.weeks ?? []));
        this.loadingSchedule.set(false);
      },
      error: () => {
        this.activeSchedule.set([]);
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
    for (const week of this.activeSchedule()) {
      for (const day of week.days) {
        for (const activity of day.activities) {
          set.add(activity.subject);
        }
      }
    }
    return Array.from(set);
  }

  private saveSchedule(): void {
    const userId = this.activeUserId();
    const examId = this.activeExamId();
    if (!userId || !examId) return;

    this.scheduleService
      .adminSaveSchedule(userId, examId, this.activeSchedule())
      .subscribe({
        next: () => {
          this.snackBar.open('Cronograma salvo', 'OK', { duration: 2000 });
        },
      });
  }
}
