import { Injectable, inject, signal } from '@angular/core';
import { DataService } from './data.service';
import { User, UserRole } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly data = inject(DataService);
  readonly currentUser = signal<User>(this.data.users[0]);

  setRole(role: UserRole): void {
    const match = this.data.users.find((u) => u.role === role);
    if (match) this.currentUser.set(match);
  }

  switchUser(userId: string): void {
    const match = this.data.users.find((u) => u.id === userId);
    if (match) this.currentUser.set(match);
  }
}
