import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'eg-results',
  standalone: true,
  imports: [
    DatePipe,
    MatSnackBarModule,
    BaseChartDirective,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <eg-page-header
      title="Results & Analytics"
      subtitle="Score distribution, pass rates, and exportable result sets"
      eyebrow="Assessment"
    >
      <button type="button" class="eg-btn eg-btn--primary" (click)="exportResults()">Export CSV</button>
    </eg-page-header>

    <div class="top">
      <div class="eg-card chart-card">
        <div class="card-head">
          <h2>Score distribution</h2>
          <span class="eg-caption">{{ results().length }} completed attempts</span>
        </div>
        <canvas baseChart [data]="barData" [options]="barOptions" [type]="'bar'"></canvas>
      </div>

      <div class="eg-card summary-card">
        <h2>Summary</h2>
        <div class="sum-row"><span>Pass rate</span><strong>{{ passRate() }}%</strong></div>
        <div class="sum-row"><span>Average score</span><strong>{{ avgScore() }}%</strong></div>
        <div class="sum-row"><span>Highest</span><strong>{{ maxScore() }}%</strong></div>
        <div class="sum-row"><span>Lowest</span><strong>{{ minScore() }}%</strong></div>
      </div>
    </div>

    <div class="eg-card panel">
      <div class="toolbar">
        <span class="eg-caption">Enterprise results ledger</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Exam</th>
            <th>Organization</th>
            <th>Score</th>
            <th>Percent</th>
            <th>Status</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          @for (r of results(); track r.id) {
            <tr>
              <td>{{ r.candidateName }}</td>
              <td>{{ r.examTitle }}</td>
              <td>{{ r.organizationName }}</td>
              <td>{{ r.score }}/{{ r.maxScore }}</td>
              <td>{{ r.percent }}%</td>
              <td><eg-status-badge [label]="r.status" [tone]="tone(r.status)" /></td>
              <td>{{ r.completedAt | date: 'MMM d, y' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
  styles: [
    `
      .top {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 16px;
        margin-bottom: 16px;
      }
      .chart-card,
      .summary-card {
        padding: 16px;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 12px;
      }
      h2 {
        font-size: 14px;
        margin: 0;
      }
      .sum-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid var(--eg-border);
        font-size: 13px;
        color: var(--eg-text-secondary);
      }
      .sum-row strong {
        color: var(--eg-text);
      }
      .panel {
        padding: 0;
        overflow: hidden;
      }
      .toolbar {
        padding: 12px 16px;
        border-bottom: 1px solid var(--eg-border);
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
      }
      .table th {
        background: #f8fafc;
        font-size: 12px;
        color: var(--eg-text-secondary);
        font-weight: 500;
      }
      @media (max-width: 900px) {
        .top {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ResultsComponent {
  private readonly data = inject(DataService);
  private readonly snack = inject(MatSnackBar);
  readonly tone = statusTone;

  results = computed(() => this.data.results);

  passRate = computed(() => {
    const rows = this.results();
    if (!rows.length) return 0;
    return Math.round((rows.filter((r) => r.status === 'Passed').length / rows.length) * 100);
  });

  avgScore = computed(() => {
    const rows = this.results();
    if (!rows.length) return 0;
    return Math.round(rows.reduce((s, r) => s + r.percent, 0) / rows.length);
  });

  maxScore = computed(() => Math.max(...this.results().map((r) => r.percent), 0));
  minScore = computed(() => Math.min(...this.results().map((r) => r.percent), 100));

  barData: ChartConfiguration<'bar'>['data'] = {
    labels: ['0–49', '50–59', '60–69', '70–79', '80–89', '90–100'],
    datasets: [
      {
        label: 'Candidates',
        data: this.buildBuckets(),
        backgroundColor: '#2563EB',
        borderRadius: 4,
      },
    ],
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
      x: { grid: { display: false } },
    },
  };

  private buildBuckets(): number[] {
    const buckets = [0, 0, 0, 0, 0, 0];
    for (const r of this.data.results) {
      const p = r.percent;
      if (p < 50) buckets[0]++;
      else if (p < 60) buckets[1]++;
      else if (p < 70) buckets[2]++;
      else if (p < 80) buckets[3]++;
      else if (p < 90) buckets[4]++;
      else buckets[5]++;
    }
    return buckets;
  }

  exportResults(): void {
    this.snack.open(
      `Export queued — ${this.results().length} rows will be delivered to your email.`,
      'OK',
      { duration: 4000 }
    );
  }
}
