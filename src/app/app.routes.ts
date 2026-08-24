import { Routes } from '@angular/router';
import { AppShellComponent } from './layout/app-shell/app-shell.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'exams',
        loadComponent: () =>
          import('./features/exams/exam-list/exam-list.component').then((m) => m.ExamListComponent),
      },
      {
        path: 'exams/create',
        loadComponent: () =>
          import('./features/exams/exam-create/exam-create.component').then((m) => m.ExamCreateComponent),
      },
      {
        path: 'questions',
        loadComponent: () =>
          import('./features/questions/question-bank/question-bank.component').then(
            (m) => m.QuestionBankComponent
          ),
      },
      {
        path: 'questions/new',
        loadComponent: () =>
          import('./features/questions/question-builder/question-builder.component').then(
            (m) => m.QuestionBuilderComponent
          ),
      },
      {
        path: 'candidates',
        loadComponent: () =>
          import('./features/candidates/candidate-list/candidate-list.component').then(
            (m) => m.CandidateListComponent
          ),
      },
      {
        path: 'candidates/new',
        loadComponent: () =>
          import('./features/candidates/candidate-register/candidate-register.component').then(
            (m) => m.CandidateRegisterComponent
          ),
      },
      {
        path: 'scheduling',
        loadComponent: () =>
          import('./features/scheduling/exam-scheduler/exam-scheduler.component').then(
            (m) => m.ExamSchedulerComponent
          ),
      },
      {
        path: 'assessment/live',
        loadComponent: () =>
          import('./features/assessment/live-monitoring/live-monitoring.component').then(
            (m) => m.LiveMonitoringComponent
          ),
      },
      {
        path: 'assessment/results',
        loadComponent: () =>
          import('./features/assessment/results/results.component').then((m) => m.ResultsComponent),
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./features/admin/user-management/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
      {
        path: 'admin/organization',
        loadComponent: () =>
          import('./features/admin/organization-settings/organization-settings.component').then(
            (m) => m.OrganizationSettingsComponent
          ),
      },
    ],
  },
];
