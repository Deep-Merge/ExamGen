import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { CATEGORIES, DIFFICULTIES, QUESTION_TYPES } from '../../../core/constants';
import { Question } from '../../../core/models';

@Component({
  selector: 'eg-question-bank',
  standalone: true,
  imports: [RouterLink, DatePipe, DecimalPipe, FormsModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="Question Bank"
      subtitle="Enterprise item repository · filters, bulk actions, and usage"
      eyebrow="Exam Management"
    >
      <a class="eg-btn eg-btn--primary" routerLink="/questions/new">New Question</a>
    </eg-page-header>

    <div class="eg-card panel">
      <div class="toolbar">
        <input
          class="eg-input search"
          [(ngModel)]="query"
          (ngModelChange)="bump()"
          placeholder="Search stem or ID…"
        />
        <select class="eg-select" [(ngModel)]="typeFilter" (ngModelChange)="bump()">
          <option value="">All types</option>
          @for (t of types; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="difficultyFilter" (ngModelChange)="bump()">
          <option value="">All difficulties</option>
          @for (d of difficulties; track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="categoryFilter" (ngModelChange)="bump()">
          <option value="">All categories</option>
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="statusFilter" (ngModelChange)="bump()">
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
        <span class="count">Showing {{ pageRows().length | number }} of {{ filtered().length | number }} · bank {{ totalBank | number }}</span>
      </div>

      @if (chips().length) {
        <div class="chips">
          @for (chip of chips(); track chip.key) {
            <button type="button" class="chip" (click)="clearChip(chip.key)">{{ chip.label }} ×</button>
          }
          <button type="button" class="chip clear" (click)="clearAll()">Clear all</button>
        </div>
      }

      @if (selectedIds().size) {
        <div class="bulk-bar">
          <span>{{ selectedIds().size }} selected</span>
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" (click)="bulk('Published')">Publish</button>
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" (click)="bulk('Archived')">Archive</button>
          <button type="button" class="eg-btn eg-btn--ghost eg-btn--sm" (click)="clearSelection()">Clear</button>
        </div>
      }

      <div class="table-scroll">
        <table>
          <thead>
            <tr>
              <th class="check">
                <input type="checkbox" [checked]="allOnPage()" (change)="togglePage($event)" aria-label="Select page" />
              </th>
              <th>ID</th>
              <th>Stem</th>
              <th>Type</th>
              <th>Difficulty</th>
              <th>Category</th>
              <th class="num">Marks</th>
              <th>Status</th>
              <th class="num">Usage</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            @for (q of pageRows(); track q.id) {
              <tr [class.on]="selectedIds().has(q.id)">
                <td class="check">
                  <input type="checkbox" [checked]="selectedIds().has(q.id)" (change)="toggle(q.id)" [attr.aria-label]="'Select ' + q.id" />
                </td>
                <td class="mono">{{ q.id }}</td>
                <td class="stem" [title]="q.stem">{{ q.stem }}</td>
                <td>{{ q.type }}</td>
                <td>{{ q.difficulty }}</td>
                <td>{{ q.category }}</td>
                <td class="num">{{ q.marks }}</td>
                <td><eg-status-badge [label]="q.status" [tone]="tone(q.status)" /></td>
                <td class="num">{{ q.usageCount }}</td>
                <td>{{ q.updatedAt | date: 'MMM d, y' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="10" class="empty">No questions match these filters.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="pager">
        <span class="eg-caption">Page {{ page() }} of {{ pageCount() }}</span>
        <div class="pager-btns">
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" [disabled]="page() <= 1" (click)="prev()">Previous</button>
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" [disabled]="page() >= pageCount()" (click)="next()">Next</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .panel {
        padding: 0;
        overflow: hidden;
      }
      .toolbar {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 14px 16px;
        border-bottom: 1px solid var(--eg-border);
        flex-wrap: wrap;
      }
      .search { max-width: 240px; }
      .eg-select { max-width: 168px; }
      .count {
        margin-left: auto;
        font-size: 13px;
        color: var(--eg-text-secondary);
      }
      .chips {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 10px 16px;
        border-bottom: 1px solid var(--eg-border);
        background: #fafbfc;
      }
      .chip {
        border: 1px solid var(--eg-border-strong);
        background: #fff;
        border-radius: 999px;
        padding: 4px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.16s ease, border-color 0.16s ease;
      }
      .chip:hover { background: #f8fafc; }
      .chip.clear { color: var(--eg-primary); border-color: #bfdbfe; }
      .bulk-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: var(--eg-primary-soft);
        border-bottom: 1px solid #dbeafe;
        font-size: 13px;
        font-weight: 550;
      }
      .table-scroll {
        overflow: auto;
        max-height: min(640px, calc(100vh - 280px));
      }
      table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      th, td {
        text-align: left;
        padding: 11px 12px;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }
      th {
        position: sticky;
        top: 0;
        background: #f8fafc;
        color: #64748b;
        font-size: 11px;
        font-weight: 650;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        z-index: 1;
      }
      tbody tr {
        transition: background 0.16s ease;
      }
      tbody tr:hover { background: #f8fafc; }
      tbody tr.on { background: #eff6ff; }
      .check { width: 40px; }
      .num { text-align: right; font-variant-numeric: tabular-nums; }
      .mono {
        font-variant-numeric: tabular-nums;
        color: #475569;
        white-space: nowrap;
      }
      .stem {
        max-width: 420px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 550;
      }
      .empty {
        text-align: center;
        color: var(--eg-text-secondary);
        padding: 48px 16px;
      }
      .pager {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-top: 1px solid var(--eg-border);
        background: #fff;
      }
      .pager-btns { display: flex; gap: 8px; }
    `,
  ],
})
export class QuestionBankComponent {
  private readonly data = inject(DataService);
  readonly tone = statusTone;
  readonly totalBank = this.data.kpis.questionBank;
  readonly pageSize = 25;

  types = QUESTION_TYPES;
  difficulties = DIFFICULTIES;
  categories = CATEGORIES;

  query = '';
  typeFilter = '';
  difficultyFilter = '';
  categoryFilter = '';
  statusFilter = '';
  page = signal(1);
  selectedIds = signal<Set<string>>(new Set());
  private readonly tick = signal(0);

  bump(): void {
    this.tick.update((n) => n + 1);
    this.page.set(1);
  }

  filtered = computed(() => {
    this.tick();
    const q = this.query.trim().toLowerCase();
    return this.data.questions().filter((item) => {
      const matchQ = !q || item.stem.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      return (
        matchQ &&
        (!this.typeFilter || item.type === this.typeFilter) &&
        (!this.difficultyFilter || item.difficulty === this.difficultyFilter) &&
        (!this.categoryFilter || item.category === this.categoryFilter) &&
        (!this.statusFilter || item.status === this.statusFilter)
      );
    });
  });

  pageCount = computed(() => Math.max(1, Math.ceil(this.filtered().length / this.pageSize)));

  pageRows = computed(() => {
    const p = Math.min(this.page(), this.pageCount());
    const start = (p - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  chips = computed(() => {
    this.tick();
    const chips: { key: string; label: string }[] = [];
    if (this.query.trim()) chips.push({ key: 'query', label: `Search: ${this.query.trim()}` });
    if (this.typeFilter) chips.push({ key: 'type', label: this.typeFilter });
    if (this.difficultyFilter) chips.push({ key: 'difficulty', label: this.difficultyFilter });
    if (this.categoryFilter) chips.push({ key: 'category', label: this.categoryFilter });
    if (this.statusFilter) chips.push({ key: 'status', label: this.statusFilter });
    return chips;
  });

  allOnPage(): boolean {
    const rows = this.pageRows();
    return rows.length > 0 && rows.every((q) => this.selectedIds().has(q.id));
  }

  toggle(id: string): void {
    const next = new Set(this.selectedIds());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    this.selectedIds.set(next);
  }

  togglePage(ev: Event): void {
    const on = (ev.target as HTMLInputElement).checked;
    const next = new Set(this.selectedIds());
    for (const q of this.pageRows()) {
      if (on) next.add(q.id);
      else next.delete(q.id);
    }
    this.selectedIds.set(next);
  }

  clearChip(key: string): void {
    if (key === 'query') this.query = '';
    if (key === 'type') this.typeFilter = '';
    if (key === 'difficulty') this.difficultyFilter = '';
    if (key === 'category') this.categoryFilter = '';
    if (key === 'status') this.statusFilter = '';
    this.bump();
  }

  clearAll(): void {
    this.query = '';
    this.typeFilter = '';
    this.difficultyFilter = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.bump();
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  prev(): void {
    this.page.update((p) => Math.max(1, p - 1));
  }

  next(): void {
    this.page.update((p) => p + 1);
  }

  bulk(status: Question['status']): void {
    const ids = this.selectedIds();
    for (const q of this.data.questions()) {
      if (ids.has(q.id)) this.data.upsertQuestion({ ...q, status });
    }
    this.selectedIds.set(new Set());
  }
}
