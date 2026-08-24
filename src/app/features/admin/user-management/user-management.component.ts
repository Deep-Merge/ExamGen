import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';
import { StatusBadgeComponent, statusTone } from '../../../shared/components/status-badge.component';
import { PERMISSIONS, ROLE_PERMISSION_MATRIX, ROLES } from '../../../core/constants';
import { UserRole } from '../../../core/models';

@Component({
  selector: 'eg-user-management',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, MatSnackBarModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <eg-page-header
      title="User Management"
      subtitle="Invite administrators, assign roles, and audit access"
      eyebrow="Administration"
    >
      <button type="button" class="eg-btn eg-btn--primary" (click)="showInvite.set(true)">Invite User</button>
    </eg-page-header>

    <div class="eg-card panel">
      <table class="table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Organization</th>
            <th>Status</th>
            <th>Last active</th>
          </tr>
        </thead>
        <tbody>
          @for (u of data.users; track u.id) {
            <tr>
              <td>
                <div class="person">
                  <span class="avatar" [style.background]="u.avatarColor">{{ initials(u.name) }}</span>
                  <span>{{ u.name }}</span>
                </div>
              </td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>{{ u.organizationName }}</td>
              <td><eg-status-badge [label]="u.status" [tone]="tone(u.status)" /></td>
              <td>{{ u.lastActive | date: 'MMM d, y' }}</td>
            </tr>
          }
        </tbody>
      </table>
    </div>

    <div class="eg-card matrix">
      <h2>Role permissions matrix</h2>
      <p class="eg-caption intro">Enterprise RBAC mapping across platform capabilities.</p>
      <div class="matrix-scroll">
        <table class="perm-table">
          <thead>
            <tr>
              <th>Permission</th>
              @for (role of roles; track role) {
                <th>{{ shortRole(role) }}</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (perm of permissions; track perm) {
              <tr>
                <td>{{ perm }}</td>
                @for (role of roles; track role) {
                  <td class="cell">
                    @if (hasPermission(role, perm)) {
                      <span class="check">✓</span>
                    }
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    @if (showInvite()) {
      <div class="modal-backdrop" (click)="showInvite.set(false)">
        <div class="modal eg-card" (click)="$event.stopPropagation()">
          <h2>Invite user</h2>
          <p class="eg-secondary">Send an enterprise invitation with role assignment.</p>
          <form [formGroup]="inviteForm" (ngSubmit)="sendInvite()">
            <div class="eg-field">
              <label class="eg-label">Full name</label>
              <input class="eg-input" formControlName="name" />
            </div>
            <div class="eg-field">
              <label class="eg-label">Work email</label>
              <input class="eg-input" type="email" formControlName="email" />
            </div>
            <div class="eg-field">
              <label class="eg-label">Role</label>
              <select class="eg-select" formControlName="role">
                @for (role of roles; track role) {
                  <option [value]="role">{{ role }}</option>
                }
              </select>
            </div>
            <div class="modal-actions">
              <button type="button" class="eg-btn eg-btn--secondary" (click)="showInvite.set(false)">Cancel</button>
              <button type="submit" class="eg-btn eg-btn--primary" [disabled]="inviteForm.invalid">Send invite</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .panel {
        padding: 0;
        overflow: hidden;
        margin-bottom: 16px;
      }
      .table {
        width: 100%;
        border-collapse: collapse;
        font-size: 13px;
      }
      .table th,
      .table td {
        text-align: left;
        padding: 12px 14px;
        border-bottom: 1px solid var(--eg-border);
        vertical-align: middle;
      }
      .table th {
        background: #f8fafc;
        font-size: 12px;
        color: var(--eg-text-secondary);
        font-weight: 500;
      }
      .person {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 11px;
        font-weight: 600;
      }
      .matrix {
        padding: 16px;
      }
      .matrix h2 {
        font-size: 16px;
        margin: 0 0 4px;
      }
      .intro {
        margin: 0 0 14px;
      }
      .matrix-scroll {
        overflow: auto;
      }
      .perm-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12px;
      }
      .perm-table th,
      .perm-table td {
        border: 1px solid var(--eg-border);
        padding: 8px 10px;
        text-align: center;
      }
      .perm-table th:first-child,
      .perm-table td:first-child {
        text-align: left;
        min-width: 160px;
        position: sticky;
        left: 0;
        background: #fff;
      }
      .perm-table th {
        background: #f8fafc;
        font-weight: 600;
        white-space: nowrap;
      }
      .check {
        color: var(--eg-success);
        font-weight: 700;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        padding: 24px;
      }
      .modal {
        width: min(440px, 100%);
        padding: 22px;
      }
      .modal h2 {
        margin-bottom: 8px;
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: 20px;
      }
    `,
  ],
})
export class UserManagementComponent {
  readonly data = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);
  readonly tone = statusTone;

  showInvite = signal(false);
  roles = ROLES;
  permissions = PERMISSIONS;
  matrix = ROLE_PERMISSION_MATRIX;

  inviteForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['Exam Manager' as UserRole, Validators.required],
  });

  initials(name: string): string {
    return name
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  shortRole(role: UserRole): string {
    return role.replace('Administrator', 'Admin').replace('Read Only ', '');
  }

  hasPermission(role: UserRole, perm: string): boolean {
    return this.matrix[role]?.includes(perm) ?? false;
  }

  sendInvite(): void {
    if (this.inviteForm.invalid) return;
    const v = this.inviteForm.getRawValue();
    this.showInvite.set(false);
    this.snack.open(`Invitation sent to ${v.email} as ${v.role}.`, 'OK', { duration: 3500 });
    this.inviteForm.reset({ role: 'Exam Manager' });
  }
}
