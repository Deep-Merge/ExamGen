import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  CATEGORIES,
  EXAM_TYPES,
  LANGUAGES,
  SHOW_RESULTS_OPTIONS,
} from '../../../core/constants';
import { Exam, Question } from '../../../core/models';
import { StepperComponent } from '../../../shared/components/stepper.component';
import { AutoSaveComponent } from '../../../shared/components/auto-save.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

@Component({
  selector: 'eg-exam-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatSnackBarModule,
    StepperComponent,
    AutoSaveComponent,
    StatusBadgeComponent,
    PageHeaderComponent,
  ],
  templateUrl: './exam-create.component.html',
  styleUrl: './exam-create.component.scss',
})
export class ExamCreateComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  steps = [
    { id: 'details', label: 'Exam Details' },
    { id: 'config', label: 'Configuration' },
    { id: 'questions', label: 'Question Selection' },
    { id: 'schedule', label: 'Schedule & Access' },
    { id: 'review', label: 'Review & Publish' },
  ];

  step = signal(0);
  saving = signal(false);
  lastSavedAt = signal<Date | null>(new Date());
  selectedQuestionIds = signal<string[]>([]);
  qFilter = signal('');
  qCategory = signal('');
  showPublishConfirm = signal(false);
  examId = `exam-draft-${Date.now()}`;

  categories = CATEGORIES;
  types = EXAM_TYPES;
  languages = LANGUAGES;
  showResultsOptions = SHOW_RESULTS_OPTIONS;
  organizations = this.data.organizations.slice(0, 24);

  detailsForm = this.fb.nonNullable.group({
    title: ['AWS Solutions Architect Associate', [Validators.required, Validators.minLength(4)]],
    code: ['AWS-SAA-2024', [Validators.required]],
    description: [
      'Enterprise certification blueprint covering AWS architecture best practices, high availability, cost optimization, and security.',
      [Validators.required, Validators.minLength(20)],
    ],
    category: ['IT Certification', Validators.required],
    type: ['Certification', Validators.required],
    language: ['English', Validators.required],
  });

  configForm = this.fb.nonNullable.group({
    totalMarks: [100, [Validators.required, Validators.min(1)]],
    passingMarks: [70, [Validators.required, Validators.min(1)]],
    durationMinutes: [120, [Validators.required, Validators.min(15)]],
    negativeMarking: [true],
    negativeValue: [0.25],
    shuffleQuestions: [true],
    shuffleAnswers: [true],
    attemptsAllowed: [2, [Validators.required, Validators.min(1)]],
    showResults: ['After Exam', Validators.required],
  });

  scheduleForm = this.fb.nonNullable.group({
    scheduledStart: [this.toLocalInput(new Date(Date.now() + 86400000))],
    scheduledEnd: [this.toLocalInput(new Date(Date.now() + 86400000 + 2 * 3600000))],
    organizationIds: [['org-001', 'org-002'] as string[]],
    accessCode: ['EV-SAA-2024'],
    requireIdVerification: [true],
    allowLateJoinMinutes: [10],
  });

  private autoSaveTimer?: ReturnType<typeof setInterval>;
  private secondsTimer?: ReturnType<typeof setInterval>;
  secondsSinceSave = signal(18);

  ngOnInit(): void {
    const published = this.data.questions().filter((q) => q.status === 'Published').slice(0, 50);
    this.selectedQuestionIds.set(published.slice(0, 50).map((q) => q.id));
    this.autoSaveTimer = setInterval(() => this.autoSave(), 15000);
    this.secondsTimer = setInterval(() => this.secondsSinceSave.update((s) => s + 1), 1000);
  }

  ngOnDestroy(): void {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    if (this.secondsTimer) clearInterval(this.secondsTimer);
  }

  filteredQuestions = computed(() => {
    const q = this.qFilter().toLowerCase();
    const cat = this.qCategory();
    return this.data
      .questions()
      .filter((item) => item.status === 'Published')
      .filter((item) => !q || item.stem.toLowerCase().includes(q) || item.id.includes(q))
      .filter((item) => !cat || item.category === cat)
      .slice(0, 80);
  });

  selectedQuestions = computed(() => {
    const set = new Set(this.selectedQuestionIds());
    return this.data.questions().filter((q) => set.has(q.id));
  });

  selectedMarks = computed(() =>
    this.selectedQuestions().reduce((sum, q) => sum + q.marks, 0)
  );

  autoSaveText = computed(() => {
    const s = this.secondsSinceSave();
    if (s < 5) return 'Draft auto-saved just now';
    if (s < 60) return `Draft auto-saved ${s} seconds ago`;
    return `Draft auto-saved ${Math.floor(s / 60)} min ago`;
  });

  get userName(): string {
    return this.auth.currentUser().name;
  }

  toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  toggleQuestion(q: Question): void {
    const ids = [...this.selectedQuestionIds()];
    const idx = ids.indexOf(q.id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(q.id);
    this.selectedQuestionIds.set(ids);
  }

  isSelected(id: string): boolean {
    return this.selectedQuestionIds().includes(id);
  }

  canNext(): boolean {
    const i = this.step();
    if (i === 0) return this.detailsForm.valid;
    if (i === 1) return this.configForm.valid;
    if (i === 2) return this.selectedQuestionIds().length >= 10;
    if (i === 3) return this.scheduleForm.valid;
    return true;
  }

  next(): void {
    if (!this.canNext()) {
      if (this.step() === 0) this.detailsForm.markAllAsTouched();
      if (this.step() === 1) this.configForm.markAllAsTouched();
      if (this.step() === 2) {
        this.snack.open('Select at least 10 questions from the bank.', 'OK', { duration: 3000 });
      }
      return;
    }
    this.step.update((s) => Math.min(s + 1, this.steps.length - 1));
    this.autoSave();
  }

  back(): void {
    this.step.update((s) => Math.max(s - 1, 0));
  }

  goStep(i: number): void {
    if (i <= this.step()) this.step.set(i);
  }

  autoSave(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.persist('Draft');
      this.saving.set(false);
      this.lastSavedAt.set(new Date());
      this.secondsSinceSave.set(0);
    }, 450);
  }

  persist(status: Exam['status']): Exam {
    const d = this.detailsForm.getRawValue();
    const c = this.configForm.getRawValue();
    const s = this.scheduleForm.getRawValue();
    const exam: Exam = {
      id: this.examId,
      title: d.title,
      code: d.code,
      description: d.description,
      category: d.category,
      type: d.type,
      language: d.language,
      totalMarks: c.totalMarks,
      passingMarks: c.passingMarks,
      durationMinutes: c.durationMinutes,
      questionCount: this.selectedQuestionIds().length,
      negativeMarking: c.negativeMarking,
      negativeValue: c.negativeValue,
      shuffleQuestions: c.shuffleQuestions,
      shuffleAnswers: c.shuffleAnswers,
      attemptsAllowed: c.attemptsAllowed,
      showResults: c.showResults,
      status,
      organizationIds: s.organizationIds,
      questionIds: this.selectedQuestionIds(),
      scheduledStart: new Date(s.scheduledStart).toISOString(),
      scheduledEnd: new Date(s.scheduledEnd).toISOString(),
      createdBy: this.userName,
      updatedAt: new Date().toISOString(),
      version: '3.4',
    };
    this.data.upsertExam(exam);
    return exam;
  }

  saveDraft(): void {
    this.persist('Draft');
    this.snack.open('Draft saved successfully.', 'OK', { duration: 2500 });
    this.secondsSinceSave.set(0);
  }

  openPublish(): void {
    if (!this.canNext() && this.step() < 4) return;
    this.showPublishConfirm.set(true);
  }

  confirmPublish(): void {
    this.persist('Published');
    this.showPublishConfirm.set(false);
    this.snack.open('Exam published. Candidates can be enrolled.', 'View', { duration: 4000 });
    this.router.navigateByUrl('/exams');
  }

  toggleOrg(id: string): void {
    const ctrl = this.scheduleForm.controls.organizationIds;
    const current = [...ctrl.value];
    const idx = current.indexOf(id);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(id);
    ctrl.setValue(current);
  }

  orgSelected(id: string): boolean {
    return this.scheduleForm.controls.organizationIds.value.includes(id);
  }
}
