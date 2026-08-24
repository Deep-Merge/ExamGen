import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { DataService } from '../../core/services/data.service';
import { PageHeaderComponent } from '../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../shared/components/status-badge.component';

Chart.register(...registerables);

type KpiKey = 'exams' | 'bank' | 'candidates' | 'orgs' | 'upcoming' | 'sessions';

@Component({
  selector: 'eg-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DecimalPipe,
    BaseChartDirective,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  template: `
    <div class="dash">
      <eg-page-header
        title="Dashboard"
        subtitle="Enterprise examination operations overview"
        eyebrow="Home"
      >
        <a class="eg-btn eg-btn--secondary" routerLink="/exams/create">Create Exam</a>
        <a class="eg-btn eg-btn--primary" routerLink="/questions/new">New Question</a>
      </eg-page-header>

      <div class="kpi-grid">
        @for (kpi of kpis; track kpi.label) {
          <div class="eg-card kpi">
            <div class="kpi-top">
              <div class="kpi-icon" [style.background]="kpi.soft" [style.color]="kpi.color">
                @switch (kpi.key) {
                  @case ('exams') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                  }
                  @case ('bank') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  }
                  @case ('candidates') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  }
                  @case ('orgs') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21h18" />
                      <path d="M5 21V7l8-4v18" />
                      <path d="M19 21V11l-6-4" />
                    </svg>
                  }
                  @case ('upcoming') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  }
                  @case ('sessions') {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                }
              </div>
              <span class="kpi-delta" [class.up]="kpi.up">{{ kpi.hint }}</span>
            </div>
            <div class="kpi-label">{{ kpi.label }}</div>
            <div class="kpi-value">{{ kpi.value | number }}</div>
          </div>
        }
      </div>

      <div class="mid">
        <div class="eg-card chart-card">
          <div class="card-head">
            <div>
              <h2>Exam completions</h2>
              <div class="eg-caption">Last 7 days · organization-wide</div>
            </div>
            <span class="live-pill">Live</span>
          </div>
          <div class="chart-wrap">
            <canvas baseChart [data]="lineData" [options]="lineOptions" [type]="'line'"></canvas>
          </div>
        </div>

        <div class="eg-card activity-card">
          <div class="card-head">
            <div>
              <h2>Recent activity</h2>
              <div class="eg-caption">Audit trail</div>
            </div>
            <span class="eg-caption">Updated {{ now | date: 'h:mm a' }}</span>
          </div>
          <ul class="activity">
            @for (item of data.activity; track item.id) {
              <li>
                <div class="act-avatar">{{ initials(item.actor) }}</div>
                <div class="act-body">
                  <div class="act-main">
                    <strong>{{ item.actor }}</strong> {{ item.action }}
                    <span class="target">{{ item.target }}</span>
                  </div>
                  <div class="eg-caption">{{ item.at | date: 'MMM d, h:mm a' }}</div>
                </div>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="bottom">
        <div class="eg-card table-card">
          <div class="card-head">
            <div>
              <h2>Upcoming sessions</h2>
              <div class="eg-caption">Next scheduled deliveries</div>
            </div>
            <a routerLink="/scheduling" class="link">View calendar →</a>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>Exam</th>
                <th>Room</th>
                <th>Start</th>
                <th>Enrolled</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (s of upcoming; track s.id) {
                <tr>
                  <td><div class="exam-name">{{ s.examTitle }}</div></td>
                  <td>{{ s.room }}</td>
                  <td>{{ s.start | date: 'MMM d, HH:mm' }}</td>
                  <td>
                    <div class="enroll">
                      <div class="mini-bar"><span [style.width.%]="(s.enrolled / s.capacity) * 100"></span></div>
                      <span>{{ s.enrolled }}/{{ s.capacity }}</span>
                    </div>
                  </td>
                  <td><eg-status-badge [label]="s.status" [tone]="tone(s.status)" /></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="eg-card chart-card">
          <div class="card-head">
            <div>
              <h2>Score distribution</h2>
              <div class="eg-caption">Last 30 days</div>
            </div>
          </div>
          <div class="chart-wrap">
            <canvas baseChart [data]="barData" [options]="barOptions" [type]="'bar'"></canvas>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dash {
        width: 100%;
        max-width: none;
      }

      .kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 14px;
        margin-bottom: 20px;
        width: 100%;
      }
      .kpi {
        padding: 18px 18px 16px;
        transition: box-shadow 0.15s, transform 0.15s, border-color 0.15s;
      }
      .kpi:hover {
        box-shadow: var(--eg-shadow-md);
        border-color: #dbe3ee;
        transform: translateY(-1px);
      }
      .kpi-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .kpi-icon svg {
        width: 19px;
        height: 19px;
        display: block;
      }
      .kpi-delta {
        font-size: 11px;
        font-weight: 600;
        color: #64748b;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 999px;
        padding: 3px 8px;
      }
      .kpi-delta.up {
        color: #047857;
        background: #ecfdf5;
        border-color: #a7f3d0;
      }
      .kpi-label {
        font-size: 12.5px;
        font-weight: 550;
        color: #64748b;
        margin-bottom: 8px;
      }
      .kpi-value {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: -0.04em;
        color: #0f172a;
        line-height: 1;
      }

      .mid,
      .bottom {
        display: grid;
        grid-template-columns: minmax(0, 1.6fr) minmax(320px, 1fr);
        gap: 16px;
        margin-bottom: 16px;
        width: 100%;
      }
      .chart-card,
      .activity-card,
      .table-card {
        padding: 20px 22px;
        width: 100%;
        min-width: 0;
      }
      .card-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
      }
      .card-head h2 {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: -0.02em;
        margin: 0 0 2px;
      }
      .live-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        height: 26px;
        padding: 0 10px;
        border-radius: 999px;
        background: #ecfdf5;
        color: #047857;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
      }
      .live-pill::before {
        content: '';
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      }
      .chart-wrap {
        height: 280px;
        width: 100%;
      }
      .chart-wrap canvas {
        max-height: 280px;
        width: 100% !important;
      }

      .activity { list-style: none; margin: 0; padding: 0; }
      .activity li {
        display: flex;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f1f5f9;
      }
      .activity li:last-child { border-bottom: none; }
      .act-avatar {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: linear-gradient(135deg, #2563eb, #60a5fa);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .act-main {
        font-size: 13px;
        color: #334155;
        line-height: 1.4;
        margin-bottom: 3px;
      }
      .target { color: #2563eb; font-weight: 600; }

      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .table th,
      .table td {
        text-align: left;
        padding: 13px 12px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }
      .table th {
        color: #64748b;
        font-weight: 600;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        background: #fafbfc;
      }
      .table tbody tr:hover { background: #f8fafc; }
      .exam-name { font-weight: 600; letter-spacing: -0.01em; }
      .enroll {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #475569;
      }
      .mini-bar {
        width: 64px;
        height: 5px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
      }
      .mini-bar span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #2563eb, #60a5fa);
      }
      .link {
        color: #2563eb;
        font-size: 13px;
        font-weight: 600;
      }

      @media (max-width: 1400px) {
        .kpi-grid { grid-template-columns: repeat(3, 1fr); }
      }
      @media (max-width: 1100px) {
        .mid, .bottom { grid-template-columns: 1fr; }
      }
      @media (max-width: 720px) {
        .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      }
    `,
  ],
})
export class DashboardComponent {
  readonly data = inject(DataService);
  readonly now = new Date();
  readonly tone = statusTone;

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0] ?? '')
      .join('')
      .slice(0, 2);
  }

  kpis: Array<{
    key: KpiKey;
    label: string;
    value: number;
    hint: string;
    up: boolean;
    color: string;
    soft: string;
  }> = [
    { key: 'exams', label: 'Active Exams', value: this.data.kpis.activeExams, hint: '+12%', up: true, color: '#2563eb', soft: '#eff6ff' },
    { key: 'bank', label: 'Question Bank', value: this.data.kpis.questionBank, hint: 'All orgs', up: false, color: '#7c3aed', soft: '#f5f3ff' },
    { key: 'candidates', label: 'Candidates', value: this.data.kpis.candidates, hint: '+4.2%', up: true, color: '#0891b2', soft: '#ecfeff' },
    { key: 'orgs', label: 'Organizations', value: this.data.kpis.organizations, hint: '48 active', up: false, color: '#059669', soft: '#ecfdf5' },
    { key: 'upcoming', label: 'Upcoming Exams', value: this.data.kpis.upcomingExams, hint: '14 days', up: false, color: '#d97706', soft: '#fffbeb' },
    { key: 'sessions', label: "Today's Sessions", value: this.data.kpis.todaysSessions, hint: '+8 today', up: true, color: '#db2777', soft: '#fdf2f8' },
  ];

  upcoming = this.data.sessions.filter((s) => s.status === 'Scheduled').slice(0, 6);

  lineData: ChartConfiguration<'line'>['data'] = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        data: [420, 510, 480, 620, 710, 390, 450],
        label: 'Completions',
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37,99,235,0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2.5,
      },
    ],
  };

  lineOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
    },
  };

  barData: ChartConfiguration<'bar'>['data'] = {
    labels: ['0-49', '50-59', '60-69', '70-79', '80-89', '90-100'],
    datasets: [
      {
        data: [28, 64, 110, 240, 310, 180],
        backgroundColor: ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
        borderRadius: 6,
        label: 'Candidates',
        barThickness: 36,
      },
    ],
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
      y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { color: '#94a3b8', font: { size: 11 } }, border: { display: false } },
    },
  };
}
