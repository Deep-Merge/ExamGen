import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { LiveMonitorCandidate, LiveCandidateState } from '../../../core/models';

@Component({
  selector: 'eg-live-monitoring',
  standalone: true,
  imports: [NgClass, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="Live Monitoring"
      subtitle="Real-time proctoring dashboard for active exam sessions"
      eyebrow="Assessment"
    >
      <span class="live-pill">● LIVE</span>
      <span class="eg-caption">Refreshes every 5s · {{ candidates().length }} candidates</span>
    </eg-page-header>

    <div class="stats">
      @for (s of stateStats(); track s.state) {
        <div class="eg-card stat">
          <div class="stat-label">{{ s.state }}</div>
          <div class="stat-value">{{ s.count }}</div>
        </div>
      }
    </div>

    <div class="layout">
      <div class="tiles">
        @for (c of candidates(); track c.id) {
          <div class="eg-card tile" [ngClass]="tileClass(c.state)">
            <div class="tile-head">
              <div>
                <div class="name">{{ c.name }}</div>
                <div class="eg-caption">{{ c.examTitle }}</div>
              </div>
              <eg-status-badge [label]="c.state" [tone]="tone(c.state)" />
            </div>
            <div class="progress-wrap">
              <div class="progress-bar">
                <span [style.width.%]="c.progress"></span>
              </div>
              <span class="eg-caption">{{ c.progress }}% complete</span>
            </div>
            <div class="tile-meta">
              <div>
                <span class="meta-label">Time left</span>
                <strong>{{ c.timeRemainingMinutes }}m</strong>
              </div>
              <div>
                <span class="meta-label">Last activity</span>
                <strong>{{ c.lastActivity }}</strong>
              </div>
              <div>
                <span class="meta-label">Alerts</span>
                <strong [class.alert]="c.alerts > 0">{{ c.alerts }}</strong>
              </div>
            </div>
          </div>
        }
      </div>

      <aside class="eg-card feed">
        <h2>Alert feed</h2>
        <ul>
          @for (alert of alerts(); track alert.id) {
            <li [class]="alert.severity">
              <div class="alert-title">{{ alert.title }}</div>
              <div class="eg-caption">{{ alert.body }}</div>
              <div class="alert-time">{{ alert.at }}</div>
            </li>
          } @empty {
            <li class="empty">No active alerts — all candidates nominal.</li>
          }
        </ul>
      </aside>
    </div>
  `,
  styles: [
    `
      .live-pill {
        color: #dc2626;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
        margin-bottom: 16px;
      }
      .stat {
        padding: 14px 16px;
      }
      .stat-label {
        font-size: 12px;
        color: var(--eg-text-secondary);
        margin-bottom: 4px;
      }
      .stat-value {
        font-size: 22px;
        font-weight: 600;
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 320px;
        gap: 16px;
        align-items: start;
      }
      .tiles {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 12px;
      }
      .tile {
        padding: 14px;
      }
      .tile.online {
        border-left: 3px solid var(--eg-success);
      }
      .tile.warning {
        border-left: 3px solid var(--eg-warning);
      }
      .tile.disconnected,
      .tile.suspicious {
        border-left: 3px solid var(--eg-danger);
      }
      .tile-head {
        display: flex;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
      }
      .name {
        font-weight: 600;
        font-size: 14px;
      }
      .progress-wrap {
        margin-bottom: 12px;
      }
      .progress-bar {
        height: 6px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 4px;
      }
      .progress-bar span {
        display: block;
        height: 100%;
        background: var(--eg-primary);
      }
      .tile-meta {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        font-size: 12px;
      }
      .meta-label {
        display: block;
        color: var(--eg-text-muted);
        margin-bottom: 2px;
      }
      .alert {
        color: var(--eg-danger);
      }
      .feed {
        padding: 16px;
        position: sticky;
        top: 80px;
        max-height: calc(100vh - 120px);
        overflow: auto;
      }
      .feed h2 {
        font-size: 14px;
        margin: 0 0 12px;
      }
      .feed ul {
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .feed li {
        padding: 10px 0;
        border-bottom: 1px solid var(--eg-border);
        font-size: 13px;
      }
      .feed li.warning .alert-title {
        color: #b45309;
      }
      .feed li.danger .alert-title {
        color: #b91c1c;
      }
      .alert-title {
        font-weight: 600;
        margin-bottom: 2px;
      }
      .alert-time {
        font-size: 11px;
        color: var(--eg-text-muted);
        margin-top: 4px;
      }
      .empty {
        color: var(--eg-text-secondary);
      }
      @media (max-width: 900px) {
        .stats {
          grid-template-columns: repeat(2, 1fr);
        }
        .layout {
          grid-template-columns: 1fr;
        }
        .feed {
          position: static;
        }
      }
    `,
  ],
})
export class LiveMonitoringComponent implements OnInit, OnDestroy {
  readonly data = inject(DataService);
  readonly tone = statusTone;

  candidates = this.data.liveCandidates;
  private timer?: ReturnType<typeof setInterval>;
  private readonly tick = signal(0);

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.data.tickLiveMonitoring();
      this.tick.update((n) => n + 1);
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  stateStats = computed(() => {
    this.tick();
    const states: LiveCandidateState[] = ['Online', 'Warning', 'Disconnected', 'Suspicious'];
    const rows = this.candidates();
    return states.map((state) => ({
      state,
      count: rows.filter((r) => r.state === state).length,
    }));
  });

  alerts = computed(() => {
    this.tick();
    return this.candidates()
      .filter((c) => c.alerts > 0 || c.state === 'Warning' || c.state === 'Suspicious')
      .map((c) => ({
        id: c.id,
        title: `${c.name} — ${c.state}`,
        body:
          c.state === 'Suspicious'
            ? 'Multiple tab switches detected during exam window.'
            : c.state === 'Warning'
              ? 'Camera feed interrupted — awaiting reconnect.'
              : `${c.alerts} proctoring alert(s) on ${c.examTitle}.`,
        at: c.lastActivity,
        severity: c.state === 'Suspicious' || c.state === 'Disconnected' ? 'danger' : 'warning',
      }));
  });

  tileClass(state: LiveCandidateState): string {
    return state.toLowerCase();
  }
}
