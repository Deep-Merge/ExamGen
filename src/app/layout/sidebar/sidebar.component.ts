import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

type IconName =
  | 'dashboard'
  | 'exams'
  | 'questions'
  | 'candidates'
  | 'scheduling'
  | 'live'
  | 'results'
  | 'users'
  | 'org';

interface NavItem {
  label: string;
  route: string;
  icon: IconName;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'eg-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-text">
          <div class="name" aria-label="Evalis">
            <span class="ch">E</span><span class="ch">v</span><span class="ch">a</span><span class="ch">l</span><span class="accent">i</span><span class="accent">s</span>
          </div>
          <div class="tag">
            <span class="rule"></span>
            <span>Enterprise Assessment</span>
            <span class="rule"></span>
          </div>
        </div>
        <span class="monogram" aria-hidden="true">E</span>
      </div>

      <nav class="nav">
        @for (group of groups; track group.title) {
          <div class="group">
            <div class="group-title">{{ group.title }}</div>
            @for (item of group.items; track item.route) {
              <a
                class="item"
                [routerLink]="item.route"
                routerLinkActive="active"
                [routerLinkActiveOptions]="{ exact: item.route === '/' }"
              >
                <span class="icon" aria-hidden="true">
                  @switch (item.icon) {
                    @case ('dashboard') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="3" width="7" height="9" rx="1" />
                        <rect x="14" y="3" width="7" height="5" rx="1" />
                        <rect x="14" y="12" width="7" height="9" rx="1" />
                        <rect x="3" y="16" width="7" height="5" rx="1" />
                      </svg>
                    }
                    @case ('exams') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    }
                    @case ('questions') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    }
                    @case ('candidates') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    }
                    @case ('scheduling') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    }
                    @case ('live') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    }
                    @case ('results') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    }
                    @case ('users') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <polyline points="16 11 18 13 22 9" />
                      </svg>
                    }
                    @case ('org') {
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 21h18" />
                        <path d="M5 21V7l8-4v18" />
                        <path d="M19 21V11l-6-4" />
                        <path d="M9 9h.01" />
                        <path d="M9 12h.01" />
                        <path d="M9 15h.01" />
                        <path d="M9 18h.01" />
                      </svg>
                    }
                  }
                </span>
                <span class="label">{{ item.label }}</span>
              </a>
            }
          </div>
        }
      </nav>

      <div class="footer">
        <div class="meta">Version 3.4 · API v2.8</div>
        <div class="meta">© Evalis Technologies</div>
      </div>
    </aside>
  `,
  styles: [
    `
      .sidebar {
        width: var(--eg-sidebar-width);
        background: #0b1220;
        color: var(--eg-sidebar-text);
        display: flex;
        flex-direction: column;
        height: 100vh;
        position: sticky;
        top: 0;
        flex-shrink: 0;
        border-right: 1px solid rgba(148, 163, 184, 0.08);
      }
      .brand {
        display: flex;
        align-items: center;
        padding: 22px 18px 18px;
        border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        background: #0b1220;
      }
      .brand-text {
        min-width: 0;
      }
      .name {
        font-weight: 650;
        font-size: 26px;
        letter-spacing: -0.055em;
        line-height: 1;
        font-feature-settings: "ss01" on, "cv11" on;
      }
      .name .ch {
        color: #f8fafc;
      }
      .name .accent {
        color: #60a5fa;
        font-weight: 700;
      }
      .tag {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 8px;
        font-size: 9px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: #94a3b8;
        white-space: nowrap;
      }
      .tag .rule {
        display: inline-block;
        width: 14px;
        height: 1px;
        background: #3b82f6;
        flex-shrink: 0;
        opacity: 0.7;
      }
      .monogram {
        display: none;
        width: 36px;
        height: 36px;
        border-radius: 10px;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 700;
        letter-spacing: -0.04em;
        color: #f8fafc;
        background: rgba(37, 99, 235, 0.16);
      }
      .nav {
        flex: 1;
        overflow-y: auto;
        padding: 14px 12px 20px;
      }
      .group {
        margin-bottom: 20px;
      }
      .group-title {
        font-size: 10.5px;
        font-weight: 650;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748b;
        padding: 6px 12px 8px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 10px 12px;
        border-radius: 10px;
        color: #94a3b8;
        font-size: 13.5px;
        font-weight: 500;
        margin-bottom: 3px;
        transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
        position: relative;
      }
      .item:hover {
        background: rgba(30, 41, 59, 0.85);
        color: #e2e8f0;
        transform: translateX(2px);
      }
      .item.active {
        background: linear-gradient(90deg, rgba(37, 99, 235, 0.28), rgba(37, 99, 235, 0.08));
        color: #fff;
        box-shadow: inset 3px 0 0 #2563eb;
      }
      .item.active .icon {
        color: #60a5fa;
      }
      .icon {
        width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        color: inherit;
      }
      .icon svg {
        width: 18px;
        height: 18px;
        display: block;
      }
      .label {
        line-height: 1.2;
      }
      .footer {
        padding: 14px 18px 18px;
        border-top: 1px solid rgba(148, 163, 184, 0.1);
      }
      .meta {
        font-size: 11px;
        color: #64748b;
        line-height: 1.55;
      }
      @media (max-width: 900px) {
        .sidebar {
          width: 76px;
        }
        .group-title,
        .label,
        .footer,
        .brand-text {
          display: none;
        }
        .monogram {
          display: inline-flex;
        }
        .brand {
          justify-content: center;
          padding: 18px 8px;
          min-height: auto;
        }
        .item {
          justify-content: center;
          padding: 12px;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  groups: NavGroup[] = [
    {
      title: 'Overview',
      items: [{ label: 'Dashboard', route: '/', icon: 'dashboard' }],
    },
    {
      title: 'Exam Management',
      items: [
        { label: 'Exams', route: '/exams', icon: 'exams' },
        { label: 'Question Bank', route: '/questions', icon: 'questions' },
      ],
    },
    {
      title: 'Candidate Management',
      items: [{ label: 'Candidates', route: '/candidates', icon: 'candidates' }],
    },
    {
      title: 'Scheduling',
      items: [{ label: 'Exam Sessions', route: '/scheduling', icon: 'scheduling' }],
    },
    {
      title: 'Assessment',
      items: [
        { label: 'Live Monitoring', route: '/assessment/live', icon: 'live' },
        { label: 'Results', route: '/assessment/results', icon: 'results' },
      ],
    },
    {
      title: 'Administration',
      items: [
        { label: 'Users & Roles', route: '/admin/users', icon: 'users' },
        { label: 'Organization', route: '/admin/organization', icon: 'org' },
      ],
    },
  ];
}
