import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { ExamSession } from '../../../core/models';

const EVENT_TONES = [
  { bg: '#eff6ff', border: '#2563eb', text: '#1e40af', time: '#2563eb' },
  { bg: '#ecfdf5', border: '#10b981', text: '#047857', time: '#059669' },
  { bg: '#fff7ed', border: '#f59e0b', text: '#b45309', time: '#d97706' },
  { bg: '#f5f3ff', border: '#8b5cf6', text: '#6d28d9', time: '#7c3aed' },
  { bg: '#fdf2f8', border: '#ec4899', text: '#be185d', time: '#db2777' },
  { bg: '#ecfeff', border: '#06b6d4', text: '#0e7490', time: '#0891b2' },
];

interface CalDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  key: string;
  sessions: Array<ExamSession & { tone: (typeof EVENT_TONES)[number]; timeLabel: string }>;
}

@Component({
  selector: 'eg-exam-scheduler',
  standalone: true,
  imports: [DatePipe, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div class="scheduler-page">
      <eg-page-header
        title="Exam Scheduler"
        subtitle="Plan sessions, rooms, and invigilator assignments"
        eyebrow="Scheduling"
      >
        <div class="view-toggle">
          <button type="button" class="toggle-btn" [class.active]="mode() === 'month'" (click)="mode.set('month')">
            Month
          </button>
          <button type="button" class="toggle-btn" [class.active]="mode() === 'week'" (click)="mode.set('week')">
            Week
          </button>
        </div>
        <button type="button" class="eg-btn eg-btn--primary" (click)="snack.open('Session draft created', 'OK', { duration: 2500 })">
          + New Session
        </button>
      </eg-page-header>

      <div class="layout">
        <div class="eg-card calendar-card">
          <div class="cal-toolbar">
            <div class="nav-btns">
              <button type="button" class="nav-btn" (click)="shift(-1)" aria-label="Previous">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <button type="button" class="nav-btn" (click)="shift(1)" aria-label="Next">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>
              </button>
              <button type="button" class="today-btn" (click)="goToday()">Today</button>
            </div>
            <h2 class="cal-title">{{ titleLabel() }}</h2>
            <div class="session-count">{{ visibleSessions().length }} sessions</div>
          </div>

          <div class="weekday-row">
            @for (d of weekdays; track d) {
              <div class="weekday">{{ d }}</div>
            }
          </div>

          <div class="month-grid" [class.week-mode]="mode() === 'week'">
            @for (day of calendarDays(); track day.key) {
              <div
                class="day-cell"
                [class.out]="!day.inMonth"
                [class.today]="day.isToday"
                (click)="onDayClick(day)"
              >
                <div class="day-num" [class.today-num]="day.isToday">{{ day.date.getDate() }}</div>
                <div class="events">
                  @for (s of day.sessions.slice(0, mode() === 'week' ? 10 : 2); track s.id) {
                    <button
                      type="button"
                      class="event"
                      [style.background]="s.tone.bg"
                      [style.border-color]="s.tone.border"
                      [style.color]="s.tone.text"
                      (click)="onSessionClick($event, s)"
                      [title]="s.examTitle + ' · ' + s.room"
                    >
                      <span class="etime" [style.color]="s.tone.time">{{ s.timeLabel }}</span>
                      <span class="etitle">{{ shortTitle(s.examTitle) }} · {{ s.room }}</span>
                    </button>
                  }
                  @if (day.sessions.length > (mode() === 'week' ? 10 : 2)) {
                    <div class="more">+{{ day.sessions.length - (mode() === 'week' ? 10 : 2) }} more</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        <aside class="side">
          <div class="eg-card room-panel">
            <div class="panel-head">
              <h2>Room capacity</h2>
              <span class="eg-caption">{{ roomStats().length }} rooms</span>
            </div>
            @for (room of roomStats(); track room.room) {
              <div class="room-row">
                <div>
                  <div class="room-name">{{ room.room }}</div>
                  <div class="eg-caption">{{ room.sessions }} sessions</div>
                </div>
                <div class="capacity">
                  <div class="bar"><span [style.width.%]="room.utilization"></span></div>
                  <span class="eg-caption">{{ room.enrolled }}/{{ room.capacity }}</span>
                </div>
              </div>
            }
          </div>

          <div class="eg-card upcoming">
            <div class="panel-head">
              <h2>Next sessions</h2>
            </div>
            @for (s of upcomingSessions(); track s.id) {
              <div class="session-row" (click)="onSessionClick($event, s)">
                <div class="session-title">{{ s.examTitle }}</div>
                <div class="eg-caption">{{ s.room }} · {{ s.start | date: 'MMM d, h:mm a' }}</div>
                <div class="session-meta">
                  <eg-status-badge [label]="s.status" [tone]="tone(s.status)" />
                  <span class="eg-caption">{{ s.enrolled }}/{{ s.capacity }}</span>
                </div>
              </div>
            }
          </div>
        </aside>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: calc(100vh - var(--eg-topbar-height) - 40px);
        max-height: calc(100vh - var(--eg-topbar-height) - 40px);
      }
      .scheduler-page {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .scheduler-page ::ng-deep eg-page-header .header {
        margin-bottom: 12px;
      }
      .scheduler-page ::ng-deep eg-page-header h1 {
        font-size: 22px;
      }
      .scheduler-page ::ng-deep eg-page-header .sub {
        display: none;
      }
      .view-toggle {
        display: inline-flex;
        padding: 3px;
        background: #f1f5f9;
        border: 1px solid var(--eg-border);
        border-radius: 10px;
        gap: 2px;
      }
      .toggle-btn {
        border: none;
        background: transparent;
        height: 32px;
        padding: 0 14px;
        border-radius: 8px;
        font-size: 13px;
        font-weight: 550;
        color: var(--eg-text-secondary);
        cursor: pointer;
      }
      .toggle-btn.active {
        background: #fff;
        color: var(--eg-primary);
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
      }
      .layout {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 280px;
        gap: 14px;
        flex: 1;
        min-height: 0;
        width: 100%;
        overflow: hidden;
      }
      .calendar-card {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }
      .cal-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 10px;
        flex-shrink: 0;
      }
      .nav-btns {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .nav-btn {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        background: #fff;
        color: #334155;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      }
      .nav-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
      }
      .today-btn {
        height: 34px;
        padding: 0 14px;
        margin-left: 4px;
        border: none;
        border-radius: 10px;
        background: linear-gradient(180deg, #3b82f6, #2563eb);
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        box-shadow: 0 2px 8px rgba(37, 99, 235, 0.28);
      }
      .today-btn:hover {
        background: linear-gradient(180deg, #2563eb, #1d4ed8);
      }
      .cal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: #0f172a;
      }
      .session-count {
        font-size: 12px;
        font-weight: 600;
        color: #64748b;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 999px;
        padding: 5px 10px;
      }
      .weekday-row {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        flex-shrink: 0;
        border: 1px solid #e2e8f0;
        border-bottom: none;
        border-radius: 12px 12px 0 0;
        overflow: hidden;
        background: #f8fafc;
      }
      .weekday {
        text-align: center;
        padding: 8px 4px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #64748b;
        border-right: 1px solid #eef2f7;
      }
      .weekday:last-child {
        border-right: none;
      }
      .month-grid {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        grid-template-rows: repeat(6, minmax(0, 1fr));
        flex: 1;
        min-height: 0;
        border: 1px solid #e2e8f0;
        border-radius: 0 0 12px 12px;
        overflow: hidden;
        background: #fff;
      }
      .month-grid.week-mode {
        grid-template-rows: minmax(0, 1fr);
      }
      .day-cell {
        border-right: 1px solid #eef2f7;
        border-bottom: 1px solid #eef2f7;
        padding: 6px;
        min-width: 0;
        min-height: 0;
        cursor: pointer;
        transition: background 0.12s;
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow: hidden;
      }
      .day-cell:nth-child(7n) {
        border-right: none;
      }
      .day-cell:hover {
        background: #fafbfc;
      }
      .day-cell.out {
        background: #fbfcfd;
      }
      .day-cell.out .day-num {
        color: #cbd5e1;
      }
      .day-cell.today {
        background: #fffbeb;
      }
      .day-num {
        align-self: flex-end;
        font-size: 11px;
        font-weight: 650;
        color: #475569;
        line-height: 1;
        margin-bottom: 2px;
        flex-shrink: 0;
      }
      .day-num.today-num {
        width: 22px;
        height: 22px;
        border-radius: 999px;
        background: #2563eb;
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .events {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-height: 0;
        overflow: hidden;
      }
      .event {
        display: flex;
        align-items: center;
        gap: 4px;
        width: 100%;
        text-align: left;
        border: 1px solid transparent;
        border-radius: 6px;
        padding: 2px 5px;
        font-size: 10.5px;
        font-weight: 550;
        cursor: pointer;
        overflow: hidden;
        line-height: 1.2;
        flex-shrink: 0;
      }
      .etime {
        font-weight: 700;
        font-size: 10px;
        flex-shrink: 0;
      }
      .etitle {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .more {
        font-size: 10px;
        font-weight: 650;
        color: #2563eb;
        padding: 1px 3px;
      }
      .side {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 0;
        height: 100%;
        overflow: hidden;
      }
      .room-panel {
        padding: 14px;
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
      .upcoming {
        padding: 14px;
        flex: 1;
        min-height: 0;
        overflow: auto;
      }
      .panel-head {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 8px;
      }
      .panel-head h2 {
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        color: #64748b;
        margin: 0;
      }
      .room-row {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 0;
        border-bottom: 1px solid var(--eg-border);
        font-size: 12.5px;
      }
      .room-name {
        font-weight: 600;
      }
      .capacity {
        text-align: right;
        min-width: 100px;
      }
      .bar {
        height: 5px;
        background: #e2e8f0;
        border-radius: 999px;
        overflow: hidden;
        margin-bottom: 4px;
      }
      .bar span {
        display: block;
        height: 100%;
        background: linear-gradient(90deg, #2563eb, #60a5fa);
      }
      .session-row {
        padding: 10px 0;
        border-bottom: 1px solid var(--eg-border);
        cursor: pointer;
      }
      .session-row:hover .session-title {
        color: #2563eb;
      }
      .session-title {
        font-size: 12.5px;
        font-weight: 600;
        margin-bottom: 3px;
      }
      .session-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 6px;
      }
      @media (max-width: 1100px) {
        .layout {
          grid-template-columns: 1fr;
        }
        .side {
          display: none;
        }
      }
    `,
  ],
})
export class ExamSchedulerComponent {
  readonly data = inject(DataService);
  readonly snack = inject(MatSnackBar);
  readonly tone = statusTone;

  weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  mode = signal<'month' | 'week'>('month');
  cursor = signal(this.startOfMonth(new Date()));

  private readonly sessions = this.data.sessions;

  private enriched = this.sessions.map((s, i) => ({
    ...s,
    tone: EVENT_TONES[i % EVENT_TONES.length],
    timeLabel: this.formatTime(new Date(s.start)),
    dayKey: this.dayKey(new Date(s.start)),
  }));

  titleLabel = computed(() => {
    const d = this.cursor();
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  });

  visibleSessions = computed(() => {
    const days = this.calendarDays();
    const keys = new Set(days.map((d) => d.key));
    return this.enriched.filter((s) => keys.has(s.dayKey));
  });

  calendarDays = computed((): CalDay[] => {
    const mode = this.mode();
    const cursor = this.cursor();
    const todayKey = this.dayKey(new Date());
    const byDay = new Map<string, typeof this.enriched>();
    for (const s of this.enriched) {
      const list = byDay.get(s.dayKey) ?? [];
      list.push(s);
      byDay.set(s.dayKey, list);
    }

    if (mode === 'week') {
      const start = this.startOfWeek(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        const key = this.dayKey(date);
        return {
          date,
          key,
          inMonth: date.getMonth() === cursor.getMonth(),
          isToday: key === todayKey,
          sessions: byDay.get(key) ?? [],
        };
      });
    }

    const monthStart = this.startOfMonth(cursor);
    const gridStart = this.startOfWeek(monthStart);
    return Array.from({ length: 42 }, (_, i) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + i);
      const key = this.dayKey(date);
      return {
        date,
        key,
        inMonth: date.getMonth() === cursor.getMonth(),
        isToday: key === todayKey,
        sessions: byDay.get(key) ?? [],
      };
    });
  });

  roomStats = computed(() => {
    const map = new Map<string, { room: string; capacity: number; enrolled: number; sessions: number }>();
    for (const s of this.sessions) {
      const cur = map.get(s.room) ?? { room: s.room, capacity: s.capacity, enrolled: 0, sessions: 0 };
      cur.enrolled += s.enrolled;
      cur.capacity = Math.max(cur.capacity, s.capacity);
      cur.sessions += 1;
      map.set(s.room, cur);
    }
    return [...map.values()]
      .map((r) => ({
        ...r,
        utilization: Math.min(100, Math.round((r.enrolled / Math.max(r.capacity, 1)) * 100)),
      }))
      .sort((a, b) => b.sessions - a.sessions);
  });

  upcomingSessions = computed(() => {
    const now = Date.now();
    return [...this.sessions]
      .filter((s) => new Date(s.start).getTime() >= now - 2 * 3600000)
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 8);
  });

  shift(dir: number): void {
    const d = new Date(this.cursor());
    if (this.mode() === 'week') d.setDate(d.getDate() + dir * 7);
    else d.setMonth(d.getMonth() + dir);
    this.cursor.set(d);
  }

  goToday(): void {
    this.cursor.set(this.mode() === 'week' ? new Date() : this.startOfMonth(new Date()));
  }

  shortTitle(title: string): string {
    return title.replace(' Associate', '').replace(' Fundamentals', '').replace(' Administrator', '');
  }

  onDayClick(day: CalDay): void {
    if (!day.sessions.length) {
      this.snack.open(`No sessions on ${day.date.toLocaleDateString()}`, 'OK', { duration: 2000 });
      return;
    }
    this.snack.open(`${day.sessions.length} session(s) on ${day.date.toLocaleDateString()}`, 'OK', {
      duration: 2500,
    });
  }

  onSessionClick(ev: Event, s: ExamSession): void {
    ev.stopPropagation();
    const overlapping = this.sessions.filter((other) => {
      if (other.id === s.id || other.room !== s.room) return false;
      const aStart = new Date(s.start).getTime();
      const aEnd = new Date(s.end).getTime();
      const bStart = new Date(other.start).getTime();
      const bEnd = new Date(other.end).getTime();
      return aStart < bEnd && bStart < aEnd;
    });
    if (overlapping.length) {
      this.snack.open(`Conflict: ${overlapping.length} overlapping in ${s.room}`, 'Dismiss', { duration: 4000 });
    } else {
      this.snack.open(`${s.examTitle} — ${s.enrolled}/${s.capacity} · ${s.invigilator}`, 'OK', {
        duration: 3000,
      });
    }
  }

  private startOfMonth(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  private startOfWeek(d: Date): Date {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - x.getDay());
    return x;
  }

  private dayKey(d: Date): string {
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  private formatTime(d: Date): string {
    const h = d.getHours();
    const m = d.getMinutes();
    const suffix = h >= 12 ? 'p' : 'a';
    const hour = ((h + 11) % 12) + 1;
    return m ? `${hour}:${String(m).padStart(2, '0')}${suffix}` : `${hour}${suffix}`;
  }
}
