import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  ViewChild,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'eg-rich-editor',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichEditorComponent),
      multi: true,
    },
  ],
  template: `
    <div class="editor" [class.compact]="compact">
      <div class="toolbar">
        <button type="button" (click)="exec('bold')" title="Bold"><b>B</b></button>
        <button type="button" (click)="exec('italic')" title="Italic"><i>I</i></button>
        <button type="button" (click)="exec('underline')" title="Underline"><u>U</u></button>
        <span class="sep"></span>
        <button type="button" (click)="exec('insertUnorderedList')" title="Bullets">• List</button>
        <button type="button" (click)="exec('insertOrderedList')" title="Numbered">1. List</button>
        <span class="sep"></span>
        <button type="button" (click)="exec('formatBlock', 'pre')" title="Code">Code</button>
      </div>
      <div
        #area
        class="area"
        contenteditable="true"
        [attr.data-placeholder]="placeholder"
        (input)="onInput()"
        (blur)="onTouched()"
      ></div>
    </div>
  `,
  styles: [
    `
      .editor {
        border: 1px solid var(--eg-border-strong);
        border-radius: var(--eg-radius-sm);
        background: #fff;
        overflow: hidden;
      }
      .toolbar {
        display: flex;
        gap: 4px;
        padding: 8px;
        border-bottom: 1px solid var(--eg-border);
        background: #f8fafc;
      }
      .toolbar button {
        border: none;
        background: transparent;
        height: 28px;
        padding: 0 8px;
        border-radius: 4px;
        cursor: pointer;
        color: var(--eg-text-secondary);
        font-size: 13px;
      }
      .toolbar button:hover {
        background: #e2e8f0;
        color: var(--eg-text);
      }
      .sep {
        width: 1px;
        background: var(--eg-border);
        margin: 4px 4px;
      }
      .area {
        min-height: 120px;
        padding: 12px;
        outline: none;
        font-size: 14px;
        line-height: 1.6;
      }
      .compact .area {
        min-height: 80px;
      }
      .area:empty:before {
        content: attr(data-placeholder);
        color: var(--eg-text-muted);
      }
    `,
  ],
})
export class RichEditorComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  @ViewChild('area') areaRef!: ElementRef<HTMLDivElement>;
  @Input() placeholder = 'Start typing…';
  @Input() compact = false;
  @Output() valueChange = new EventEmitter<string>();

  private value = '';
  private onChange: (v: string) => void = () => undefined;
  onTouched: () => void = () => undefined;

  ngAfterViewInit(): void {
    if (this.value) this.areaRef.nativeElement.innerHTML = this.value;
  }

  ngOnDestroy(): void {}

  writeValue(value: string): void {
    this.value = value || '';
    if (this.areaRef) this.areaRef.nativeElement.innerHTML = this.value;
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  exec(cmd: string, value?: string): void {
    this.areaRef.nativeElement.focus();
    document.execCommand(cmd, false, value);
    this.onInput();
  }

  onInput(): void {
    const html = this.areaRef.nativeElement.innerHTML;
    this.value = html;
    this.onChange(html);
    this.valueChange.emit(html);
  }
}
