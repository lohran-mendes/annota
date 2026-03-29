import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { TopicService } from '../../../core/services/topic.service';
import { SubjectService } from '../../../core/services/subject.service';
import { TopicDialog } from '../dialogs/topic-dialog';
import { ConfirmDialog } from '../dialogs/confirm-dialog';
import type { Topic, Subject } from '@annota/shared';

interface TopicRow {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  questionCount: number;
}

interface SubjectGroup {
  subject: Subject;
  topics: TopicRow[];
}

@Component({
  selector: 'annota-topic-management',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatExpansionModule, MatProgressSpinnerModule],
  templateUrl: './topic-management.html',
  styleUrl: './topic-management.scss',
})
export class TopicManagement implements OnInit {
  private readonly topicService = inject(TopicService);
  private readonly subjectService = inject(SubjectService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  topics = signal<TopicRow[]>([]);
  subjects = signal<Subject[]>([]);
  loading = signal(false);

  groupedBySubject = computed<SubjectGroup[]>(() => {
    const subjects = this.subjects();
    const topics = this.topics();

    return subjects.map((subject) => ({
      subject,
      topics: topics.filter((t) => t.subjectId === subject.id),
    }));
  });

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
        this.subjects.set(subjects.data);
        this.topics.set(
          topics.data.map((t) => ({
            id: t.id,
            name: t.name,
            subjectId: t.subjectId,
            subjectName: subjects.data.find((s) => s.id === t.subjectId)?.name ?? '—',
            questionCount: t.questionCount,
          })),
        );
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(TopicDialog, { data: { subjects: this.subjects() } });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.topicService.create(result).subscribe({
          next: () => {
            this.snackBar.open('Tópico criado com sucesso!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao criar tópico.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  openEditDialog(topic: TopicRow) {
    const ref = this.dialog.open(TopicDialog, {
      data: {
        topic: { id: topic.id, subjectId: topic.subjectId, name: topic.name, questionCount: topic.questionCount },
        subjects: this.subjects(),
      },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.topicService.update(topic.id, { name: result.name }).subscribe({
          next: () => {
            this.snackBar.open('Tópico atualizado!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao atualizar tópico.', 'OK', { duration: 3000 }),
        });
      }
    });
  }

  confirmDelete(topic: TopicRow) {
    const ref = this.dialog.open(ConfirmDialog, {
      data: { title: 'Excluir Tópico', message: `Deseja excluir "${topic.name}"? Esta ação não pode ser desfeita.` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.topicService.delete(topic.id).subscribe({
          next: () => {
            this.snackBar.open('Tópico excluído!', 'OK', { duration: 3000 });
            this.loadData();
          },
          error: () => this.snackBar.open('Erro ao excluir tópico.', 'OK', { duration: 3000 }),
        });
      }
    });
  }
}
