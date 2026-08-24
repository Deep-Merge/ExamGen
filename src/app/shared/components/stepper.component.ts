import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass } from '@angular/common';

export interface StepItem {
  id: string;
  label: string;
}

@Component({
  selector: 'eg-stepper',
  standalone: true,
  imports: [NgClass],
  template: `
    <ol class="steps">
      @for (step of steps; track step.id; let i = $index) {
        <li
          class="step"
          [ngClass]="{
            active: i === activeIndex,
            done: i < activeIndex,
            clickable: allowNavigate
          }"
          (click)="onClick(i)"
        >
          <span class="idx">{{ i + 1 }}</span>
          <span class="label">{{ step.label }}</span>
          @if (i < steps.length - 1) {
            <span class="line"></span>
          }
        </li>
      }
    </ol>
  `,
  styles: [
    `
      .steps {
        display: flex;
        gap: 0;
        list-style: none;
        margin: 0;
        padding: 0;
        overflow-x: auto;
      }
      .step {
        position: relative;
        display: flex;
        align-items: center;
        gap: 10px;
        padding-right: 28px;
        color: var(--eg-text-muted);
        flex-shrink: 0;
      }
      .step.clickable {
        cursor: pointer;
      }
      .idx {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid var(--eg-border-strong);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        background: #fff;
      }
      .label {
        font-size: 13px;
        font-weight: 500;
      }
      .line {
        position: absolute;
        right: 8px;
        top: 50%;
        width: 16px;
        height: 2px;
        background: var(--eg-border);
      }
      .step.active {
        color: var(--eg-primary);
      }
      .step.active .idx {
        border-color: var(--eg-primary);
        background: var(--eg-primary);
        color: #fff;
      }
      .step.done {
        color: var(--eg-text);
      }
      .step.done .idx {
        border-color: var(--eg-success);
        background: var(--eg-success);
        color: #fff;
      }
      .step.done .line {
        background: var(--eg-success);
      }
    `,
  ],
})
export class StepperComponent {
  @Input({ required: true }) steps: StepItem[] = [];
  @Input() activeIndex = 0;
  @Input() allowNavigate = false;
  @Output() stepChange = new EventEmitter<number>();

  onClick(i: number): void {
    if (this.allowNavigate && i <= this.activeIndex) this.stepChange.emit(i);
  }
}
