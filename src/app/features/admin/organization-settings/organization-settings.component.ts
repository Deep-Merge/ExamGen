import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DataService } from '../../../core/services/data.service';
import { PageHeaderComponent } from '../../../shared/components/page-header.component';

type SettingsTab = 'branding' | 'security' | 'password' | 'api' | 'billing';

@Component({
  selector: 'eg-organization-settings',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, PageHeaderComponent],
  template: `
    <eg-page-header
      title="Organization Settings"
      subtitle="Tenant branding, security policies, and billing configuration"
      eyebrow="Administration"
    >
      <button type="button" class="eg-btn eg-btn--primary" (click)="save()">Save changes</button>
    </eg-page-header>

    <div class="tabs">
      @for (t of tabs; track t.id) {
        <button type="button" class="tab" [class.active]="activeTab() === t.id" (click)="activeTab.set(t.id)">
          {{ t.label }}
        </button>
      }
    </div>

    <div class="eg-card content">
      @if (activeTab() === 'branding') {
        <h2>Branding</h2>
        <form [formGroup]="brandingForm">
          <div class="eg-grid-2">
            <div class="eg-field">
              <label class="eg-label">Organization display name</label>
              <input class="eg-input" formControlName="displayName" />
            </div>
            <div class="eg-field">
              <label class="eg-label">Support email</label>
              <input class="eg-input" type="email" formControlName="supportEmail" />
            </div>
          </div>
          <div class="eg-field">
            <label class="eg-label">Custom domain</label>
            <input class="eg-input" formControlName="customDomain" placeholder="exams.yourcompany.com" />
          </div>
          <div class="eg-grid-2">
            <div class="eg-field">
              <label class="eg-label">Primary color</label>
              <input class="eg-input" type="color" formControlName="primaryColor" />
            </div>
            <div class="eg-field">
              <label class="eg-label">Logo URL</label>
              <input class="eg-input" formControlName="logoUrl" />
            </div>
          </div>
        </form>
      }

      @if (activeTab() === 'security') {
        <h2>Security — SSO & MFA</h2>
        <form [formGroup]="securityForm">
          <div class="toggle-row">
            <div>
              <div class="t-title">SAML 2.0 Single Sign-On</div>
              <div class="eg-caption">Authenticate via Azure AD, Okta, or Google Workspace</div>
            </div>
            <label class="eg-toggle">
              <input type="checkbox" formControlName="ssoEnabled" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="eg-field">
            <label class="eg-label">Identity Provider Entity ID</label>
            <input class="eg-input" formControlName="idpEntityId" />
          </div>
          <div class="eg-field">
            <label class="eg-label">SSO Login URL</label>
            <input class="eg-input" formControlName="ssoLoginUrl" />
          </div>
          <div class="toggle-row">
            <div>
              <div class="t-title">Enforce MFA for all users</div>
              <div class="eg-caption">Require TOTP or WebAuthn at login</div>
            </div>
            <label class="eg-toggle">
              <input type="checkbox" formControlName="mfaRequired" />
              <span class="slider"></span>
            </label>
          </div>
          <div class="eg-field">
            <label class="eg-label">Session timeout (minutes)</label>
            <input class="eg-input" type="number" formControlName="sessionTimeout" />
          </div>
        </form>
      }

      @if (activeTab() === 'password') {
        <h2>Password Policy</h2>
        <form [formGroup]="passwordForm">
          <div class="eg-grid-2">
            <div class="eg-field">
              <label class="eg-label">Minimum length</label>
              <input class="eg-input" type="number" formControlName="minLength" />
            </div>
            <div class="eg-field">
              <label class="eg-label">Password expiry (days)</label>
              <input class="eg-input" type="number" formControlName="expiryDays" />
            </div>
          </div>
          <div class="toggles">
            <label class="check-row"><input type="checkbox" formControlName="requireUppercase" /> Require uppercase</label>
            <label class="check-row"><input type="checkbox" formControlName="requireNumber" /> Require number</label>
            <label class="check-row"><input type="checkbox" formControlName="requireSymbol" /> Require symbol</label>
            <label class="check-row"><input type="checkbox" formControlName="preventReuse" /> Prevent last 5 passwords</label>
          </div>
        </form>
      }

      @if (activeTab() === 'api') {
        <h2>API Keys</h2>
        <p class="eg-caption intro">Programmatic access for LMS integrations and webhooks.</p>
        <div class="key-list">
          @for (key of apiKeys; track key.id) {
            <div class="key-row">
              <div>
                <div class="key-name">{{ key.name }}</div>
                <div class="eg-caption">{{ key.prefix }}•••••••• · Created {{ key.created }}</div>
              </div>
              <button type="button" class="eg-btn eg-btn--ghost eg-btn--sm" (click)="revokeKey(key.name)">Revoke</button>
            </div>
          }
        </div>
        <button type="button" class="eg-btn eg-btn--secondary" (click)="generateKey()">Generate new key</button>
      }

      @if (activeTab() === 'billing') {
        <h2>Billing</h2>
        <form [formGroup]="billingForm">
          <div class="billing-banner">
            <div>
              <div class="plan-name">Enterprise Plan</div>
              <div class="eg-caption">Unlimited exams · 50,000 candidate seats · SSO included</div>
            </div>
            <strong>$4,800 / month</strong>
          </div>
          <div class="eg-grid-2">
            <div class="eg-field">
              <label class="eg-label">Billing contact</label>
              <input class="eg-input" formControlName="billingContact" />
            </div>
            <div class="eg-field">
              <label class="eg-label">PO number</label>
              <input class="eg-input" formControlName="poNumber" />
            </div>
          </div>
          <div class="eg-field">
            <label class="eg-label">Payment method</label>
            <select class="eg-select" formControlName="paymentMethod">
              <option>Invoice (Net 30)</option>
              <option>Credit card · Visa •••• 4242</option>
              <option>ACH transfer</option>
            </select>
          </div>
          <div class="eg-field">
            <label class="eg-label">Billing address</label>
            <textarea class="eg-textarea" rows="2" formControlName="billingAddress"></textarea>
          </div>
        </form>
      }
    </div>
  `,
  styles: [
    `
      .tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 16px;
        border-bottom: 1px solid var(--eg-border);
        overflow-x: auto;
      }
      .tab {
        padding: 10px 16px;
        border: none;
        background: transparent;
        font-size: 13px;
        font-weight: 500;
        color: var(--eg-text-secondary);
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        white-space: nowrap;
      }
      .tab.active {
        color: var(--eg-primary);
        border-bottom-color: var(--eg-primary);
      }
      .content {
        padding: 22px 24px;
      }
      .content h2 {
        font-size: 16px;
        margin: 0 0 16px;
      }
      .intro {
        margin: -8px 0 16px;
      }
      .toggle-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        padding: 12px 14px;
        border: 1px solid var(--eg-border);
        border-radius: 8px;
        background: #fafbfc;
        margin-bottom: 14px;
      }
      .t-title {
        font-weight: 600;
        font-size: 14px;
      }
      .toggles {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .check-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 14px;
        cursor: pointer;
      }
      .key-list {
        border: 1px solid var(--eg-border);
        border-radius: 8px;
        margin-bottom: 14px;
      }
      .key-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 14px;
        border-bottom: 1px solid var(--eg-border);
      }
      .key-name {
        font-weight: 600;
        font-size: 13px;
      }
      .billing-banner {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        background: var(--eg-primary-soft);
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .plan-name {
        font-weight: 600;
        font-size: 15px;
        margin-bottom: 4px;
      }
    `,
  ],
})
export class OrganizationSettingsComponent {
  private readonly data = inject(DataService);
  private readonly fb = inject(FormBuilder);
  private readonly snack = inject(MatSnackBar);

  activeTab = signal<SettingsTab>('branding');
  org = this.data.organizations[0];

  tabs: { id: SettingsTab; label: string }[] = [
    { id: 'branding', label: 'Branding' },
    { id: 'security', label: 'Security (SSO/MFA)' },
    { id: 'password', label: 'Password Policy' },
    { id: 'api', label: 'API Keys' },
    { id: 'billing', label: 'Billing' },
  ];

  brandingForm = this.fb.nonNullable.group({
    displayName: [this.org?.name ?? 'Evalis Technologies'],
    supportEmail: ['support@evalis.io'],
    customDomain: ['exams.evalis.io'],
    primaryColor: ['#2563EB'],
    logoUrl: ['https://cdn.evalis.io/logo.svg'],
  });

  securityForm = this.fb.nonNullable.group({
    ssoEnabled: [true],
    idpEntityId: ['urn:evalis:azure-ad-prod'],
    ssoLoginUrl: ['https://login.microsoftonline.com/saml2'],
    mfaRequired: [true],
    sessionTimeout: [480],
  });

  passwordForm = this.fb.nonNullable.group({
    minLength: [12],
    expiryDays: [90],
    requireUppercase: [true],
    requireNumber: [true],
    requireSymbol: [true],
    preventReuse: [true],
  });

  billingForm = this.fb.nonNullable.group({
    billingContact: ['billing@evalis.io'],
    poNumber: ['PO-2024-ENT-00482'],
    paymentMethod: ['Invoice (Net 30)'],
    billingAddress: ['350 Fifth Avenue, New York, NY 10118'],
  });

  apiKeys = [
    { id: '1', name: 'Production LMS Integration', prefix: 'ev_live_', created: 'Jan 12, 2024' },
    { id: '2', name: 'Webhook — Results Export', prefix: 'ev_live_', created: 'Mar 3, 2024' },
    { id: '3', name: 'Sandbox / Staging', prefix: 'ev_test_', created: 'Jun 18, 2024' },
  ];

  save(): void {
    this.snack.open('Organization settings saved successfully.', 'OK', { duration: 3000 });
  }

  generateKey(): void {
    this.snack.open('New API key generated — copy it now; it won\'t be shown again.', 'OK', { duration: 4500 });
  }

  revokeKey(name: string): void {
    this.snack.open(`API key "${name}" revoked.`, 'OK', { duration: 3000 });
  }
}
