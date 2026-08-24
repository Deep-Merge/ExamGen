import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { CANDIDATE_STATUSES } from '../../../core/constants';

@Component({
  selector: 'eg-candidate-list',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="Candidates"
      subtitle="Manage enrollment, verification, and exam assignment"
      eyebrow="Candidate Management"
    >
      <a class="eg-btn eg-btn--primary" routerLink="/candidates/new">Register Candidate</a>
    </eg-page-header>

    <div class="eg-card panel">
      <div class="toolbar">
        <input
          class="eg-input search"
          [(ngModel)]="query"
          (ngModelChange)="bump()"
          placeholder="Search name or email…"
        />
        <select class="eg-select" [(ngModel)]="statusFilter" (ngModelChange)="bump()">
          <option value="">All statuses</option>
          @for (s of statuses; track s) {
            <option [value]="s">{{ s }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="orgFilter" (ngModelChange)="bump()">
          <option value="">All organizations</option>
          @for (org of orgOptions; track org) {
            <option [value]="org">{{ org }}</option>
          }
        </select>
        <span class="eg-caption">{{ filtered().length }} candidates</span>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Organization</th>
            <th>Exam</th>
            <th>Group</th>
            <th>Status</th>
            <th>Score</th>
            <th>Registered</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of filtered(); track c.id) {
            <tr>
              <td>
                <div class="person">
                  <span class="avatar" [style.background]="c.avatarColor">{{ initials(c) }}</span>
                  <div>
                    <div class="name">{{ c.firstName }} {{ c.lastName }}</div>
                    <div class="eg-caption">{{ c.email }}</div>
                  </div>
                </div>
              </td>
              <td>
                <div>{{ c.organizationName }}</div>
                <div class="eg-caption">{{ c.department }}</div>
              </td>
              <td>{{ c.examTitles[0] || '—' }}</td>
              <td>{{ c.groupName }}</td>
              <td><eg-status-badge [label]="c.status" [tone]="tone(c.status)" /></td>
              <td>{{ c.score != null ? c.score + '%' : '—' }}</td>
              <td>{{ c.registeredAt | date: 'MMM d, y' }}</td>
              <td><a class="link" routerLink="/candidates/new">Edit</a></td>
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
        max-width: 260px;
      }
      .eg-select {
        max-width: 200px;
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
        vertical-align: middle;
      }
      .table th {
        background: #f8fafc;
        font-size: 12px;
        color: var(--eg-text-secondary);
        font-weight: 500;
      }
      .person {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }
      .name {
        font-weight: 600;
      }
      .link {
        color: var(--eg-primary);
        font-weight: 500;
      }
    `,
  ],
})
export class CandidateListComponent {
  readonly data = inject(DataService);
  readonly tone = statusTone;
  statuses = CANDIDATE_STATUSES;
  query = '';
  statusFilter = '';
  orgFilter = '';
  private readonly tick = signal(0);

  orgOptions = [...new Set(this.data.candidates().map((c) => c.organizationName))].slice(0, 12);

  bump(): void {
    this.tick.update((n) => n + 1);
  }

  filtered = computed(() => {
    this.tick();
    const q = this.query.trim().toLowerCase();
    const st = this.statusFilter;
    const org = this.orgFilter;
    return this.data.candidates().filter((c) => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchQ = !q || name.includes(q) || c.email.toLowerCase().includes(q);
      const matchS = !st || c.status === st;
      const matchO = !org || c.organizationName === org;
      return matchQ && matchS && matchO;
    });
  });

  initials(c: { firstName: string; lastName: string }): string {
    return `${c.firstName[0] ?? ''}${c.lastName[0] ?? ''}`.toUpperCase();
  }
}
