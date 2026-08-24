import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'eg-status-badge',
  standalone: true,
  imports: [NgClass],
  template: `
    <span class="badge" [ngClass]="toneClass">{{ label }}</span>
  `,
  styles: [
    `
      .badge {
        display: inline-flex;
        align-items: center;
        height: 24px;
        padding: 0 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 500;
        white-space: nowrap;
      }
      .neutral {
        background: #f1f5f9;
        color: #475569;
      }
      .info {
        background: var(--eg-info-soft);
        color: #1d4ed8;
      }
      .success {
        background: var(--eg-success-soft);
        color: #047857;
      }
      .warning {
        background: var(--eg-warning-soft);
        color: #b45309;
      }
      .danger {
        background: var(--eg-danger-soft);
        color: #b91c1c;
      }
    `,
  ],
})
export class StatusBadgeComponent {
  @Input({ required: true }) label!: string;
  @Input() tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger' = 'neutral';

  get toneClass(): string {
    return this.tone;
  }
}

export function statusTone(status: string): 'neutral' | 'info' | 'success' | 'warning' | 'danger' {
  const s = status.toLowerCase();
  if (['published', 'passed', 'completed', 'active', 'online', 'verified', 'approved'].includes(s))
    return 'success';
  if (['live', 'taking exam', 'checked in', 'scheduled', 'invited'].includes(s)) return 'info';
  if (['draft', 'under review', 'warning', 'registered'].includes(s)) return 'warning';
  if (['failed', 'disqualified', 'suspended', 'cancelled', 'disconnected', 'suspicious', 'archived'].includes(s))
    return 'danger';
  return 'neutral';
}
