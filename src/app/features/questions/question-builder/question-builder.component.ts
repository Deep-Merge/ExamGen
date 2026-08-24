import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CATEGORIES,
  DIFFICULTIES,
  FULLY_SUPPORTED_QUESTION_TYPES,
  QUESTION_TYPES,
} from '../../../core/constants';
import { AnswerOption, Question, QuestionType } from '../../../core/models';
import { RichEditorComponent } from '../../../shared/components/rich-editor.component';
import { AutoSaveComponent } from '../../../shared/components/auto-save.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'eg-question-builder',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatSnackBarModule,
    RichEditorComponent,
    AutoSaveComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './question-builder.component.html',
  styleUrl: './question-builder.component.scss',
})
export class QuestionBuilderComponent implements OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  types = QUESTION_TYPES;
  supported = new Set(FULLY_SUPPORTED_QUESTION_TYPES);
  difficulties = DIFFICULTIES;
  categories = CATEGORIES;

  activeType = signal<QuestionType>('Multiple Choice');
  showPreview = signal(false);
  showVersions = signal(false);
  saving = signal(false);
  secondsSinceSave = signal(12);
  tagInput = '';
  attachments = signal<{ name: string; size: string }[]>([
    { name: 'architecture-diagram.png', size: '248 KB' },
  ]);

  questionId = `q-new-${Date.now()}`;
  versions = [
    { version: '1.3', updatedAt: new Date().toISOString(), updatedBy: 'Priya Sharma', note: 'Current working draft' },
    { version: '1.2', updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(), updatedBy: 'Liam Nguyen', note: 'Updated distractor C' },
    { version: '1.1', updatedAt: new Date(Date.now() - 86400000 * 6).toISOString(), updatedBy: 'Emily Johnson', note: 'Initial SME review' },
  ];

  form = this.fb.nonNullable.group({
    stem: [
      'Which of the following AWS services is primarily used for identity and access management across accounts?',
      [Validators.required, Validators.minLength(12)],
    ],
    explanation: [
      '<p>AWS IAM is the primary service for managing users, roles, policies, and federated access. Other services consume IAM but do not replace it.</p>',
    ],
    marks: [2, [Validators.required, Validators.min(1)]],
    difficulty: ['Medium' as const, Validators.required],
    category: ['AWS Security', Validators.required],
    tags: [['aws', 'iam', 'security'] as string[]],
    options: this.fb.array(this.defaultOptions()),
  });

  private timer = setInterval(() => this.secondsSinceSave.update((s) => s + 1), 1000);
  private auto = setInterval(() => this.autoSave(), 15000);

  get options(): FormArray {
    return this.form.controls.options;
  }

  autoSaveText = computed(() => {
    const s = this.secondsSinceSave();
    return s < 60 ? `Draft auto-saved ${s} seconds ago` : `Draft auto-saved ${Math.floor(s / 60)} min ago`;
  });

  get userName(): string {
    return this.auth.currentUser().name;
  }

  isSupported(type: QuestionType): boolean {
    return this.supported.has(type);
  }

  isInteractiveType(): boolean {
    const t = this.activeType();
    return t === 'Multiple Choice' || t === 'Multiple Response' || t === 'True / False';
  }

  isAdvancedType(): boolean {
    return !this.isSupported(this.activeType());
  }

  selectType(type: QuestionType): void {
    this.activeType.set(type);
    if (this.isSupported(type)) {
      this.rebuildOptions(type);
    } else {
      this.options.clear();
    }
  }

  defaultOptions() {
    return [
      this.fb.nonNullable.group({ id: 'A', label: 'A', text: 'Amazon S3', isCorrect: false }),
      this.fb.nonNullable.group({ id: 'B', label: 'B', text: 'AWS IAM', isCorrect: true }),
      this.fb.nonNullable.group({ id: 'C', label: 'C', text: 'Amazon CloudFront', isCorrect: false }),
      this.fb.nonNullable.group({ id: 'D', label: 'D', text: 'AWS CloudTrail', isCorrect: false }),
    ];
  }

  rebuildOptions(type: QuestionType): void {
    this.options.clear();
    if (type === 'Essay' || type === 'Fill in Blank') return;
    if (type === 'True / False') {
      this.options.push(this.fb.nonNullable.group({ id: 'A', label: 'A', text: 'True', isCorrect: true }));
      this.options.push(this.fb.nonNullable.group({ id: 'B', label: 'B', text: 'False', isCorrect: false }));
      return;
    }
    this.defaultOptions().forEach((g) => this.options.push(g));
  }

  addOption(): void {
    const label = String.fromCharCode(65 + this.options.length);
    this.options.push(
      this.fb.nonNullable.group({ id: label, label, text: '', isCorrect: false })
    );
  }

  removeOption(i: number): void {
    if (this.options.length <= 2) return;
    this.options.removeAt(i);
  }

  setCorrect(i: number): void {
    const multi = this.activeType() === 'Multiple Response';
    this.options.controls.forEach((ctrl, idx) => {
      if (multi) {
        if (idx === i) ctrl.patchValue({ isCorrect: !ctrl.value.isCorrect });
      } else {
        ctrl.patchValue({ isCorrect: idx === i });
      }
    });
  }

  addTag(): void {
    const t = this.tagInput.trim().toLowerCase();
    if (!t) return;
    const tags = [...this.form.controls.tags.value];
    if (!tags.includes(t)) tags.push(t);
    this.form.controls.tags.setValue(tags);
    this.tagInput = '';
  }

  removeTag(tag: string): void {
    this.form.controls.tags.setValue(this.form.controls.tags.value.filter((t) => t !== tag));
  }

  onFiles(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files || []);
    this.attachments.update((list) => [
      ...list,
      ...files.map((f) => ({ name: f.name, size: `${Math.max(1, Math.round(f.size / 1024))} KB` })),
    ]);
    input.value = '';
  }

  removeAttachment(name: string): void {
    this.attachments.update((list) => list.filter((a) => a.name !== name));
  }

  autoSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.persist('Draft');
      this.saving.set(false);
      this.secondsSinceSave.set(0);
    }, 400);
  }

  persist(status: Question['status']): void {
    const v = this.form.getRawValue();
    const question: Question = {
      id: this.questionId,
      stem: v.stem,
      type: this.activeType(),
      difficulty: v.difficulty,
      category: v.category,
      tags: v.tags,
      marks: v.marks,
      options: v.options as AnswerOption[],
      explanation: v.explanation,
      status,
      usageCount: 0,
      createdBy: this.userName,
      updatedAt: new Date().toISOString(),
      version: '1.3',
      versions: this.versions,
    };
    this.data.upsertQuestion(question);
  }

  saveDraft(): void {
    if (this.form.controls.stem.invalid) {
      this.form.controls.stem.markAsTouched();
      return;
    }
    this.persist('Draft');
    this.snack.open('Question draft saved.', 'OK', { duration: 2500 });
    this.secondsSinceSave.set(0);
  }

  save(): void {
    if (this.form.controls.stem.invalid) {
      this.form.controls.stem.markAsTouched();
      return;
    }
    const opts = this.form.getRawValue().options;
    if (this.isInteractiveType() && !opts.some((o) => o.isCorrect)) {
      this.snack.open('Mark at least one correct answer.', 'OK', { duration: 3000 });
      return;
    }
    this.persist('Published');
    this.snack.open('Question published to the bank.', 'View bank', { duration: 3500 });
    this.router.navigateByUrl('/questions');
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    clearInterval(this.auto);
  }
}
