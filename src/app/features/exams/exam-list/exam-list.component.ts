import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { EXAM_STATUSES } from '../../../core/constants';

@Component({
  selector: 'eg-exam-list',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="Exams"
      subtitle="Author, review, and publish examination blueprints"
      eyebrow="Exam Management"
    >
      <a class="eg-btn eg-btn--primary" routerLink="/exams/create">Create Exam</a>
    </eg-page-header>

    <div class="eg-card panel">
      <div class="toolbar">
        <input class="eg-input search" [(ngModel)]="query" (ngModelChange)="bump()" placeholder="Filter by title or code…" />
        <select class="eg-select status" [(ngModel)]="statusFilter" (ngModelChange)="bump()">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        <span class="eg-caption">{{ filtered().length }} exams · Last modified by Emily Johnson</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Exam</th>
            <th>Code</th>
            <th>Category</th>
            <th>Duration</th>
            <th>Questions</th>
            <th>Pass</th>
            <th>Status</th>
            <th>Updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (exam of filtered(); track exam.id) {
            <tr>
              <td>
                <div class="title">{{ exam.title }}</div>
                <div class="eg-caption">v{{ exam.version }} · {{ exam.type }}</div>
              </td>
              <td>{{ exam.code }}</td>
              <td>{{ exam.category }}</td>
              <td>{{ exam.durationMinutes }} min</td>
              <td>{{ exam.questionCount }}</td>
              <td>{{ exam.passingMarks }}</td>
              <td><eg-status-badge [label]="exam.status" [tone]="tone(exam.status)" /></td>
              <td>{{ exam.updatedAt | date: 'MMM d, y' }}</td>
              <td><a class="link" routerLink="/exams/create">Open</a></td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .panel {
        padding: 0;
        overflow: hidden;
      }
      .toolbar {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid var(--eg-border);
        flex-wrap: wrap;
      }
      .search {
        max-width: 280px;
      }
      .status {
        max-width: 180px;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .table th,
      .table td {
        text-align: left;
        padding: 12px 14px;
        border-bottom: 1px solid var(--eg-border);
        vertical-align: top;
      }
      .table th {
        background: #f8fafc;
        font-size: 12px;
        color: var(--eg-text-secondary);
        font-weight: 500;
      }
      .title {
        font-weight: 600;
      }
      .link {
        color: var(--eg-primary);
        font-weight: 500;
      }
    `,
  ],
})
export class ExamListComponent {
  readonly data = inject(DataService);
  readonly tone = statusTone;
  statuses = EXAM_STATUSES;
  query = '';
  statusFilter = '';
  private readonly tick = signal(0);

  bump(): void {
    this.tick.update((n) => n + 1);
  }

  filtered = computed(() => {
    this.tick();
    const exams = this.data.exams();
    const q = this.query.trim().toLowerCase();
    const st = this.statusFilter;
    return exams.filter((e) => {
      const matchQ =
        !q || e.title.toLowerCase().includes(q) || e.code.toLowerCase().includes(q);
      const matchS = !st || e.status === st;
      return matchQ && matchS;
    });
  });
}
