import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { AuthService } from '../../../core/services/auth.service';
import { COUNTRIES, DEPARTMENTS } from '../../../core/constants';
import { Candidate } from '../../../core/models';
import { StepperComponent } from '../../../shared/components/stepper.component';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge.component';

@Component({
  selector: 'eg-candidate-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    MatSnackBarModule,
    StepperComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './candidate-register.component.html',
  styleUrl: './candidate-register.component.scss',
})
export class CandidateRegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly data = inject(DataService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snack = inject(MatSnackBar);

  steps = [
    { id: 'personal', label: 'Personal' },
    { id: 'organization', label: 'Organization' },
    { id: 'exams', label: 'Exam Assignment' },
    { id: 'access', label: 'Access & Permissions' },
    { id: 'review', label: 'Review' },
  ];

  step = signal(0);
  candidateId = `cand-${Date.now()}`;
  createdAt = new Date();
  avatarPreview = signal<string | null>(null);
  idProofFile = signal<string | null>(null);
  resumeFile = signal<string | null>(null);
  selectedExamIds = signal<string[]>([]);

  countries = COUNTRIES;
  departments = DEPARTMENTS;
  organizations = this.data.organizations.slice(0, 24);
  publishedExams = computed(() => this.data.exams().filter((e) => e.status === 'Published'));

  personalForm = this.fb.nonNullable.group({
    firstName: ['Alex', [Validators.required, Validators.minLength(2)]],
    lastName: ['Rivera', [Validators.required, Validators.minLength(2)]],
    email: ['alex.rivera@example.com', [Validators.required, Validators.email]],
    phone: ['+1 (555) 234-5678', Validators.required],
    dateOfBirth: ['1995-06-15', Validators.required],
    gender: ['Prefer not to say', Validators.required],
    address: ['425 Enterprise Blvd', Validators.required],
    city: ['Seattle', Validators.required],
    country: ['United States', Validators.required],
  });

  orgForm = this.fb.nonNullable.group({
    organizationId: ['org-001', Validators.required],
    department: ['Engineering', Validators.required],
    groupName: ['Cohort Alpha', Validators.required],
    employeeId: ['EMP-10482'],
    managerEmail: ['manager@example.com'],
  });

  accessForm = this.fb.nonNullable.group({
    sendInvite: [true],
    requireMfa: [true],
    allowRemoteProctor: [true],
    accessWindowStart: [this.toLocalInput(new Date(Date.now() + 86400000))],
    accessWindowEnd: [this.toLocalInput(new Date(Date.now() + 86400000 * 14))],
    notes: ['Standard enterprise enrollment with ID verification.'],
  });

  get userName(): string {
    return this.auth.currentUser().name;
  }

  selectedOrgName = computed(() => {
    const id = this.orgForm.controls.organizationId.value;
    return this.organizations.find((o) => o.id === id)?.name ?? '';
  });

  selectedExams = computed(() => {
    const set = new Set(this.selectedExamIds());
    return this.publishedExams().filter((e) => set.has(e.id));
  });

  avatarInitials = computed(() => {
    const p = this.personalForm.getRawValue();
    return `${(p.firstName[0] ?? '').toUpperCase()}${(p.lastName[0] ?? '').toUpperCase()}`;
  });

  toLocalInput(d: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onFilePick(event: Event, kind: 'id' | 'resume'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (kind === 'id') this.idProofFile.set(file.name);
    else this.resumeFile.set(file.name);
  }

  removeFile(kind: 'id' | 'resume'): void {
    if (kind === 'id') this.idProofFile.set(null);
    else this.resumeFile.set(null);
  }

  toggleExam(id: string): void {
    const ids = [...this.selectedExamIds()];
    const idx = ids.indexOf(id);
    if (idx >= 0) ids.splice(idx, 1);
    else ids.push(id);
    this.selectedExamIds.set(ids);
  }

  isExamSelected(id: string): boolean {
    return this.selectedExamIds().includes(id);
  }

  canNext(): boolean {
    const i = this.step();
    if (i === 0) return this.personalForm.valid;
    if (i === 1) return this.orgForm.valid;
    if (i === 2) return this.selectedExamIds().length > 0;
    if (i === 3) return this.accessForm.valid;
    return true;
  }

  next(): void {
    if (!this.canNext()) {
      if (this.step() === 0) this.personalForm.markAllAsTouched();
      if (this.step() === 1) this.orgForm.markAllAsTouched();
      if (this.step() === 2) {
        this.snack.open('Select at least one published exam.', 'OK', { duration: 3000 });
      }
      if (this.step() === 3) this.accessForm.markAllAsTouched();
      return;
    }
    this.step.update((s) => Math.min(s + 1, this.steps.length - 1));
  }

  back(): void {
    this.step.update((s) => Math.max(s - 1, 0));
  }

  goStep(i: number): void {
    if (i <= this.step()) this.step.set(i);
  }

  persist(): Candidate {
    const p = this.personalForm.getRawValue();
    const o = this.orgForm.getRawValue();
    const exams = this.selectedExams();
    const candidate: Candidate = {
      id: this.candidateId,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.email,
      phone: p.phone,
      dateOfBirth: p.dateOfBirth,
      gender: p.gender,
      address: p.address,
      city: p.city,
      country: p.country,
      organizationId: o.organizationId,
      organizationName: this.selectedOrgName(),
      department: o.department,
      examIds: exams.map((e) => e.id),
      examTitles: exams.map((e) => e.title),
      status: 'Registered',
      avatarColor: '#2563EB',
      registeredAt: new Date().toISOString(),
      groupName: o.groupName,
    };
    this.data.upsertCandidate(candidate);
    return candidate;
  }

  submit(): void {
    this.persist();
    this.snack.open('Candidate registered successfully.', 'View', { duration: 3500 });
    this.router.navigateByUrl('/candidates');
  }
}
