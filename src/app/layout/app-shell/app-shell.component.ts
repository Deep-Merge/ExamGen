import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';

@Component({
  selector: 'eg-app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="shell">
      <eg-sidebar />
      <div class="main">
        <eg-topbar />
        <main class="content eg-page-enter">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell {
        display: flex;
        min-height: 100vh;
        height: 100vh;
        overflow: hidden;
        background: var(--eg-bg);
      }
      .main {
        flex: 1;
        min-width: 0;
        min-height: 0;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .content {
        padding: 20px 24px;
        flex: 1;
        min-height: 0;
        width: 100%;
        overflow: auto;
        background:
          radial-gradient(1400px 480px at 100% -12%, rgba(37, 99, 235, 0.06), transparent 55%),
          var(--eg-bg);
      }
      @media (max-width: 720px) {
        .content {
          padding: 16px;
        }
      }
    `,
  ],
})
export class AppShellComponent {}
