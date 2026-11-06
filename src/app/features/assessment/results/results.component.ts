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
      <button type="button" class="export-btn" (click)="exportResults()">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 3v12" />
          <path d="m7 11 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
        Export CSV
      </button>
    </eg-page-header>

    <div class="top">
      <div class="eg-card chart-card">
        <div class="card-head">
          <div>
            <h2>Score distribution</h2>
            <div class="eg-caption">{{ results().length }} completed attempts · last 30 days</div>
          </div>
        </div>
        <div class="chart-wrap">
          <canvas baseChart [data]="chartData" [options]="chartOptions" [type]="'line'"></canvas>
        </div>
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
        grid-template-columns: minmax(0, 1.4fr) minmax(240px, 320px);
        gap: 16px;
        margin-bottom: 16px;
        align-items: stretch;
      }
      .export-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        height: 38px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1px solid #dbe3ee;
        background: #fff;
        color: #0f172a;
        font-size: 13.5px;
        font-weight: 600;
        letter-spacing: -0.01em;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
        transition: background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, transform 0.18s ease;
      }
      .export-btn:hover {
        background: #f8fafc;
        border-color: #93c5fd;
        color: #1d4ed8;
        box-shadow: 0 6px 16px rgba(37, 99, 235, 0.12);
        transform: translateY(-1px);
      }
      .export-btn:active {
        transform: translateY(0);
      }
      .chart-card,
      .summary-card {
        padding: 18px 20px;
      }
      .chart-wrap {
        height: 240px;
      }
      .chart-wrap canvas {
        max-height: 240px;
        width: 100% !important;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 8px;
      }
      h2 {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 0 0 2px;
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

  chartData: ChartConfiguration<'line'>['data'] = {
    labels: ['0–49', '50–59', '60–69', '70–79', '80–89', '90–100'],
    datasets: [
      {
        label: 'Candidates',
        data: this.buildBuckets(),
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.10)',
        fill: true,
        tension: 0.42,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#2563EB',
        pointBorderWidth: 2,
        borderWidth: 2,
      },
    ],
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8', font: { size: 11 } },
        border: { display: false },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { color: '#94a3b8', font: { size: 11 }, precision: 0, maxTicksLimit: 5 },
        border: { display: false },
      },
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
    const rows = this.results();
    const header = ['Candidate', 'Exam', 'Organization', 'Score', 'Max', 'Percent', 'Status', 'Completed'];
    const body = rows.map((r) =>
      [r.candidateName, r.examTitle, r.organizationName, r.score, r.maxScore, r.percent, r.status, r.completedAt]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv = [header.join(','), ...body].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'evalis-results.csv';
    link.click();
    URL.revokeObjectURL(url);
    this.snack.open(`Exported ${rows.length} rows.`, 'OK', { duration: 2500 });
  }
}
