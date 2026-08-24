import { Component, Input } from '@angular/core';

@Component({
  selector: 'eg-auto-save',
  standalone: true,
  template: `
    <div class="wrap" [class.saving]="saving">
      <span class="dot"></span>
      <span>{{ saving ? 'Saving draft…' : text }}</span>
    </div>
  `,
  styles: [
    `
      .wrap {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--eg-text-secondary);
      }
      .dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--eg-success);
      }
      .saving .dot {
        background: var(--eg-warning);
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        50% {
          opacity: 0.4;
        }
      }
    `,
  ],
})
export class AutoSaveComponent {
  @Input() text = 'Draft auto-saved';
  @Input() saving = false;
}
