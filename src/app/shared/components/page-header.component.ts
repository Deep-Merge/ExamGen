import { Component, Input } from '@angular/core';

@Component({
  selector: 'eg-page-header',
  standalone: true,
  template: `
    <div class="header">
      <div class="left">
        @if (eyebrow) {
          <div class="eyebrow">{{ eyebrow }}</div>
        }
        <h1>{{ title }}</h1>
        @if (subtitle) {
          <p class="sub">{{ subtitle }}</p>
        }
      </div>
      <div class="actions">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 20px;
      }
      .eyebrow {
        font-size: 12px;
        color: var(--eg-text-secondary);
        margin-bottom: 4px;
      }
      h1 {
        font-size: 24px;
        font-weight: 650;
        letter-spacing: -0.03em;
        margin: 0;
        color: var(--eg-text);
      }
      .sub {
        margin: 6px 0 0;
        color: var(--eg-text-secondary);
        font-size: 14px;
      }
      .actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class PageHeaderComponent {
  @Input({ required: true }) title!: string;
  @Input() subtitle = '';
  @Input() eyebrow = '';
}
