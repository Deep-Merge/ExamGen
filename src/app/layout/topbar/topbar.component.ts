import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { DataService } from '../../core/services/data.service';
import { ROLES } from '../../core/constants';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'eg-topbar',
  standalone: true,
  imports: [RouterLink, DatePipe, FormsModule],
  template: `
    <header class="topbar">
      <div class="search-wrap">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round">
          <circle cx="11" cy="11" r="7.5" />
          <path d="m16.5 16.5 4 4" />
        </svg>
        <input
          class="search"
          [(ngModel)]="query"
          (focus)="searchOpen.set(true)"
          placeholder="Search exams, questions, candidates…"
        />
        <kbd class="kbd">⌘K</kbd>
        @if (searchOpen() && filtered().length) {
          <div class="search-panel">
            @for (hit of filtered(); track hit.route + hit.label) {
              <a [routerLink]="hit.route" (click)="searchOpen.set(false)">
                <span class="hit-type">{{ hit.type }}</span>
                <span>{{ hit.label }}</span>
              </a>
            }
          </div>
        }
      </div>

      <div class="right">
        <button
          class="icon-btn"
          type="button"
          [class.open]="notifOpen()"
          (click)="toggleNotif($event)"
          title="Notifications"
          aria-label="Notifications"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
            <path d="M9.5 17a2.5 2.5 0 0 0 5 0" />
          </svg>
          @if (unread) {
            <span class="badge">{{ unread > 9 ? '9+' : unread }}</span>
          }
        </button>

        @if (notifOpen()) {
          <div class="dropdown notif" (click)="$event.stopPropagation()">
            <div class="dd-head">
              <div>
                <div class="dd-title">Notifications</div>
                <div class="dd-sub">{{ unread }} unread · last 24 hours</div>
              </div>
              <button type="button" class="mark-all" (click)="markAllRead()">Mark all read</button>
            </div>
            <div class="notif-list">
              @for (n of data.notifications; track n.id) {
                <div class="notif-item" [class.unread]="!n.read">
                  <div class="n-dot" [class.on]="!n.read"></div>
                  <div class="n-content">
                    <div class="n-title">{{ n.title }}</div>
                    <div class="n-body">{{ n.body }}</div>
                    <div class="n-at">{{ n.at | date: 'MMM d · h:mm a' }}</div>
                  </div>
                </div>
              }
            </div>
            <a class="dd-foot" routerLink="/assessment/live" (click)="notifOpen.set(false)">View live monitoring</a>
          </div>
        }

        <div class="divider"></div>

        <button class="user" type="button" (click)="toggleUser($event)">
          <div class="avatar" [style.background]="user().avatarColor">{{ initials }}</div>
          <div class="user-meta">
            <div class="hi">{{ user().name }}</div>
            <div class="role">{{ user().role }}</div>
          </div>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        @if (userOpen()) {
          <div class="dropdown user-dd" (click)="$event.stopPropagation()">
            <div class="dd-title-plain">Switch role view</div>
            @for (role of roles; track role) {
              <button type="button" class="role-btn" [class.active]="user().role === role" (click)="switchRole(role)">
                {{ role }}
              </button>
            }
          </div>
        }
      </div>
    </header>
  `,
  styles: [
    `
      .topbar {
        height: var(--eg-topbar-height);
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(226, 232, 240, 0.9);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 28px;
        position: sticky;
        top: 0;
        z-index: 20;
        gap: 16px;
      }

      .search-wrap {
        position: relative;
        flex: 1;
        max-width: 480px;
        display: flex;
        align-items: center;
        gap: 10px;
        height: 40px;
        padding: 0 12px 0 14px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #f8fafc;
        color: #94a3b8;
        transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
      }
      .search-wrap:focus-within {
        border-color: #93c5fd;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        background: #fff;
        color: #64748b;
      }
      .search {
        border: none;
        background: transparent;
        outline: none;
        width: 100%;
        color: var(--eg-text);
        font-size: 13.5px;
      }
      .kbd {
        font-family: inherit;
        font-size: 11px;
        font-weight: 600;
        color: #94a3b8;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 2px 6px;
        line-height: 1.2;
      }
      .search-panel {
        position: absolute;
        top: calc(100% + 8px);
        left: 0;
        right: 0;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 14px;
        box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12);
        overflow: hidden;
        z-index: 30;
      }
      .search-panel a {
        display: flex;
        gap: 10px;
        padding: 11px 14px;
        font-size: 13px;
      }
      .search-panel a:hover {
        background: #f8fafc;
      }
      .hit-type {
        color: #94a3b8;
        min-width: 72px;
        font-size: 11px;
        font-weight: 650;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      .right {
        display: flex;
        align-items: center;
        gap: 10px;
        position: relative;
      }

      .icon-btn {
        position: relative;
        width: 40px;
        height: 40px;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        background: #fff;
        cursor: pointer;
        color: #64748b;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: background 0.15s, border-color 0.15s, color 0.15s, box-shadow 0.15s;
      }
      .icon-btn:hover {
        background: #f8fafc;
        border-color: #cbd5e1;
        color: #0f172a;
      }
      .icon-btn.open {
        background: #eff6ff;
        border-color: #bfdbfe;
        color: #2563eb;
        box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
      }
      .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        min-width: 18px;
        height: 18px;
        padding: 0 5px;
        border-radius: 999px;
        background: linear-gradient(180deg, #f87171, #ef4444);
        border: 2px solid #fff;
        color: #fff;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 6px rgba(239, 68, 68, 0.35);
      }

      .divider {
        width: 1px;
        height: 28px;
        background: #e2e8f0;
        margin: 0 2px;
      }

      .user {
        display: flex;
        align-items: center;
        gap: 10px;
        cursor: pointer;
        padding: 4px 8px 4px 4px;
        border-radius: 12px;
        border: 1px solid transparent;
        background: transparent;
        color: inherit;
        transition: background 0.15s, border-color 0.15s;
      }
      .user:hover {
        background: #f8fafc;
        border-color: #e2e8f0;
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 10px;
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
      }
      .hi {
        font-size: 13px;
        font-weight: 650;
        letter-spacing: -0.01em;
        text-align: left;
      }
      .role {
        font-size: 11px;
        color: #64748b;
        text-align: left;
      }

      .dropdown {
        position: absolute;
        top: calc(100% + 10px);
        right: 0;
        width: 360px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 16px;
        box-shadow: 0 18px 48px rgba(15, 23, 42, 0.14);
        z-index: 40;
        overflow: hidden;
      }
      .user-dd {
        width: 280px;
        padding-bottom: 6px;
      }
      .dd-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 12px;
        padding: 14px 16px 12px;
        border-bottom: 1px solid #f1f5f9;
      }
      .dd-title {
        font-size: 14px;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: #0f172a;
      }
      .dd-sub {
        margin-top: 2px;
        font-size: 12px;
        color: #94a3b8;
      }
      .dd-title-plain {
        padding: 12px 14px 6px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #94a3b8;
      }
      .mark-all {
        border: none;
        background: transparent;
        color: #2563eb;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        white-space: nowrap;
      }
      .notif-list {
        max-height: 340px;
        overflow: auto;
      }
      .notif-item {
        display: flex;
        gap: 10px;
        padding: 12px 16px;
        border-bottom: 1px solid #f8fafc;
        transition: background 0.12s;
      }
      .notif-item:hover {
        background: #f8fafc;
      }
      .notif-item.unread {
        background: linear-gradient(90deg, #eff6ff, #fff);
      }
      .n-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #e2e8f0;
        margin-top: 5px;
        flex-shrink: 0;
      }
      .n-dot.on {
        background: #2563eb;
        box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
      }
      .n-title {
        font-weight: 650;
        font-size: 13px;
        letter-spacing: -0.01em;
      }
      .n-body {
        font-size: 12.5px;
        color: #64748b;
        margin-top: 2px;
        line-height: 1.45;
      }
      .n-at {
        font-size: 11px;
        color: #94a3b8;
        margin-top: 6px;
      }
      .dd-foot {
        display: block;
        text-align: center;
        padding: 12px;
        font-size: 13px;
        font-weight: 600;
        color: #2563eb;
        border-top: 1px solid #f1f5f9;
        background: #fafbfc;
      }
      .dd-foot:hover {
        background: #f1f5f9;
      }
      .role-btn {
        display: block;
        width: calc(100% - 12px);
        margin: 2px 6px;
        text-align: left;
        border: none;
        background: transparent;
        padding: 9px 10px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px;
        color: #334155;
      }
      .role-btn:hover,
      .role-btn.active {
        background: #eff6ff;
        color: #1d4ed8;
      }

      @media (max-width: 720px) {
        .user-meta,
        .kbd {
          display: none;
        }
        .search-wrap {
          max-width: none;
        }
        .dropdown {
          width: min(360px, calc(100vw - 32px));
        }
      }
    `,
  ],
})
export class TopbarComponent {
  readonly auth = inject(AuthService);
  readonly data = inject(DataService);

  query = '';
  searchOpen = signal(false);
  notifOpen = signal(false);
  userOpen = signal(false);
  roles = ROLES;
  private readOverride = signal(false);

  get user() {
    return this.auth.currentUser;
  }

  get firstName(): string {
    return this.user().name.split(' ')[0];
  }

  get initials(): string {
    return this.user()
      .name.split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2);
  }

  get unread(): number {
    if (this.readOverride()) return 0;
    return this.data.notifications.filter((n) => !n.read).length;
  }

  filtered() {
    const q = this.query.trim().toLowerCase();
    if (!q) return [];
    const hits: { type: string; label: string; route: string }[] = [];
    for (const e of this.data.exams().slice(0, 40)) {
      if (e.title.toLowerCase().includes(q) || e.code.toLowerCase().includes(q)) {
        hits.push({ type: 'Exam', label: e.title, route: '/exams' });
      }
    }
    for (const c of this.data.candidates().slice(0, 40)) {
      const name = `${c.firstName} ${c.lastName}`;
      if (name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) {
        hits.push({ type: 'Candidate', label: name, route: '/candidates' });
      }
    }
    for (const qn of this.data.questions().slice(0, 40)) {
      if (qn.stem.toLowerCase().includes(q)) {
        hits.push({ type: 'Question', label: qn.stem.slice(0, 64), route: '/questions' });
      }
    }
    return hits.slice(0, 8);
  }

  toggleNotif(ev: MouseEvent): void {
    ev.stopPropagation();
    this.notifOpen.update((v) => !v);
    this.userOpen.set(false);
  }

  toggleUser(ev: MouseEvent): void {
    ev.stopPropagation();
    this.userOpen.update((v) => !v);
    this.notifOpen.set(false);
  }

  markAllRead(): void {
    this.readOverride.set(true);
  }

  switchRole(role: (typeof ROLES)[number]): void {
    this.auth.setRole(role);
    this.userOpen.set(false);
  }

  @HostListener('document:click')
  onDocClick(): void {
    this.searchOpen.set(false);
    this.notifOpen.set(false);
    this.userOpen.set(false);
  }
}
