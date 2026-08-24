import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { AllCommunityModule, ColDef, GridApi, GridReadyEvent, ModuleRegistry, RowSelectionOptions } from 'ag-grid-community';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { CATEGORIES, DIFFICULTIES, QUESTION_TYPES } from '../../../core/constants';
import { Question } from '../../../core/models';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'eg-question-bank',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule, AgGridAngular, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="Question Bank"
      subtitle="Enterprise item repository with versioning and usage analytics"
      eyebrow="Exam Management"
    >
      <a class="eg-btn eg-btn--primary" routerLink="/questions/new">New Question</a>
    </eg-page-header>

    <div class="eg-card panel">
      <div class="toolbar">
        <input
          class="eg-input search"
          [(ngModel)]="query"
          (ngModelChange)="applyFilters()"
          placeholder="Filter stem or ID…"
        />
        <select class="eg-select" [(ngModel)]="typeFilter" (ngModelChange)="applyFilters()">
          <option value="">All types</option>
          @for (t of types; track t) {
            <option [value]="t">{{ t }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="difficultyFilter" (ngModelChange)="applyFilters()">
          <option value="">All difficulties</option>
          @for (d of difficulties; track d) {
            <option [value]="d">{{ d }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="categoryFilter" (ngModelChange)="applyFilters()">
          <option value="">All categories</option>
          @for (c of categories; track c) {
            <option [value]="c">{{ c }}</option>
          }
        </select>
        <select class="eg-select" [(ngModel)]="statusFilter" (ngModelChange)="applyFilters()">
          <option value="">All statuses</option>
          <option value="Draft">Draft</option>
          <option value="Published">Published</option>
          <option value="Archived">Archived</option>
        </select>
        <span class="count">Showing {{ filteredCount() | number }} of {{ totalBank | number }}</span>
      </div>

      @if (activeFilterChips().length) {
        <div class="chips">
          @for (chip of activeFilterChips(); track chip.key) {
            <button type="button" class="chip" (click)="clearChip(chip.key)">
              {{ chip.label }} ×
            </button>
          }
          <button type="button" class="chip clear" (click)="clearAllFilters()">Clear all</button>
        </div>
      }

      @if (selectedCount() > 0) {
        <div class="bulk-bar">
          <span>{{ selectedCount() }} selected</span>
          <eg-status-badge [label]="bulkStatus()" tone="info" />
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" (click)="bulkPublish()">Publish</button>
          <button type="button" class="eg-btn eg-btn--secondary eg-btn--sm" (click)="bulkArchive()">Archive</button>
          <button type="button" class="eg-btn eg-btn--ghost eg-btn--sm" (click)="clearSelection()">Clear</button>
        </div>
      }

      <div class="grid-wrap ag-theme-alpine">
        <ag-grid-angular
          style="width: 100%; height: 520px"
          [rowData]="rowData()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [rowSelection]="rowSelection"
          [pagination]="true"
          [paginationPageSize]="50"
          [animateRows]="true"
          (selectionChanged)="onSelectionChanged()"
          (gridReady)="onGridReady($event)"
        />
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
      .search {
        max-width: 220px;
      }
      .eg-select {
        max-width: 160px;
      }
      .count {
        margin-left: auto;
        font-size: 13px;
        color: var(--eg-text-secondary);
        white-space: nowrap;
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
      }
      .chip.clear {
        color: var(--eg-primary);
        border-color: var(--eg-primary);
      }
      .bulk-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 16px;
        background: var(--eg-primary-soft);
        border-bottom: 1px solid var(--eg-border);
        font-size: 13px;
      }
      .grid-wrap {
        padding: 0 1px 1px;
      }
      :host ::ng-deep .ag-cell .status-pill {
        display: inline-flex;
        align-items: center;
        height: 22px;
        padding: 0 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 500;
      }
      :host ::ng-deep .status-pill.success {
        background: var(--eg-success-soft);
        color: #047857;
      }
      :host ::ng-deep .status-pill.warning {
        background: var(--eg-warning-soft);
        color: #b45309;
      }
      :host ::ng-deep .status-pill.neutral {
        background: #f1f5f9;
        color: #475569;
      }
    `,
  ],
})
export class QuestionBankComponent {
  private readonly data = inject(DataService);
  private readonly datePipe = inject(DatePipe);

  readonly totalBank = this.data.kpis.questionBank;
  types = QUESTION_TYPES.slice(0, 8);
  difficulties = DIFFICULTIES;
  categories = CATEGORIES.slice(0, 12);

  query = '';
  typeFilter = '';
  difficultyFilter = '';
  categoryFilter = '';
  statusFilter = '';
  private readonly filterTick = signal(0);
  private readonly selectionTick = signal(0);
  private gridApi: GridApi<Question> | null = null;

  rowSelection: RowSelectionOptions = { mode: 'multiRow', checkboxes: true, headerCheckbox: true };

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 90,
  };

  columnDefs: ColDef<Question>[] = [
    { field: 'id', headerName: 'ID', width: 110, pinned: 'left' },
    {
      field: 'stem',
      headerName: 'Stem',
      flex: 2,
      minWidth: 280,
      tooltipField: 'stem',
      valueFormatter: (p) => (p.value?.length > 80 ? `${p.value.slice(0, 80)}…` : p.value),
    },
    { field: 'type', headerName: 'Type', width: 140 },
    { field: 'difficulty', headerName: 'Difficulty', width: 110 },
    { field: 'category', headerName: 'Category', width: 130 },
    { field: 'marks', headerName: 'Marks', width: 90 },
    {
      field: 'status',
      headerName: 'Status',
      width: 110,
      cellRenderer: (p: { value: string }) => {
        const tone = statusTone(p.value);
        return `<span class="status-pill ${tone}">${p.value}</span>`;
      },
    },
    { field: 'usageCount', headerName: 'Usage', width: 90 },
    {
      field: 'updatedAt',
      headerName: 'Updated',
      width: 120,
      valueFormatter: (p) => this.datePipe.transform(p.value, 'MMM d, y') ?? '',
    },
  ];

  rowData = computed(() => {
    this.filterTick();
    const q = this.query.trim().toLowerCase();
    return this.data.questions().filter((item) => {
      const matchQ = !q || item.stem.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
      const matchType = !this.typeFilter || item.type === this.typeFilter;
      const matchDiff = !this.difficultyFilter || item.difficulty === this.difficultyFilter;
      const matchCat = !this.categoryFilter || item.category === this.categoryFilter;
      const matchStatus = !this.statusFilter || item.status === this.statusFilter;
      return matchQ && matchType && matchDiff && matchCat && matchStatus;
    });
  });

  filteredCount = computed(() => this.rowData().length);

  activeFilterChips = computed(() => {
    this.filterTick();
    const chips: { key: string; label: string }[] = [];
    if (this.query.trim()) chips.push({ key: 'query', label: `Search: ${this.query.trim()}` });
    if (this.typeFilter) chips.push({ key: 'type', label: `Type: ${this.typeFilter}` });
    if (this.difficultyFilter) chips.push({ key: 'difficulty', label: `Difficulty: ${this.difficultyFilter}` });
    if (this.categoryFilter) chips.push({ key: 'category', label: `Category: ${this.categoryFilter}` });
    if (this.statusFilter) chips.push({ key: 'status', label: `Status: ${this.statusFilter}` });
    return chips;
  });

  selectedCount = computed(() => {
    this.selectionTick();
    return this.gridApi?.getSelectedRows().length ?? 0;
  });

  applyFilters(): void {
    this.filterTick.update((n) => n + 1);
  }

  clearChip(key: string): void {
    if (key === 'query') this.query = '';
    if (key === 'type') this.typeFilter = '';
    if (key === 'difficulty') this.difficultyFilter = '';
    if (key === 'category') this.categoryFilter = '';
    if (key === 'status') this.statusFilter = '';
    this.applyFilters();
  }

  clearAllFilters(): void {
    this.query = '';
    this.typeFilter = '';
    this.difficultyFilter = '';
    this.categoryFilter = '';
    this.statusFilter = '';
    this.applyFilters();
  }

  onGridReady(event: GridReadyEvent<Question>): void {
    this.gridApi = event.api;
  }

  onSelectionChanged(): void {
    this.selectionTick.update((n) => n + 1);
  }

  bulkStatus(): string {
    return `${this.selectedCount()} items`;
  }

  bulkPublish(): void {
    const rows = this.gridApi?.getSelectedRows() ?? [];
    rows.forEach((q) => this.data.upsertQuestion({ ...q, status: 'Published' }));
    this.clearSelection();
  }

  bulkArchive(): void {
    const rows = this.gridApi?.getSelectedRows() ?? [];
    rows.forEach((q) => this.data.upsertQuestion({ ...q, status: 'Archived' }));
    this.clearSelection();
  }

  clearSelection(): void {
    this.gridApi?.deselectAll();
    this.selectionTick.update((n) => n + 1);
  }
}
