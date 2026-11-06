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
        <main class="content">
          <div class="content-frame eg-page-enter">
            <router-outlet />
          </div>
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
        padding: 22px 28px 28px;
        flex: 1;
        min-height: 0;
        width: 100%;
        overflow: auto;
        display: flex;
        justify-content: center;
        background:
          radial-gradient(1200px 420px at 80% -8%, rgba(37, 99, 235, 0.05), transparent 50%),
          var(--eg-bg);
      }
      .content-frame {
        width: 75%;
        max-width: 1280px;
        min-width: 0;
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      .content-frame > :not(router-outlet) {
        width: 100%;
        flex: 1 1 auto;
        min-height: 0;
      }
      @media (max-width: 1100px) {
        .content-frame {
          width: 100%;
          max-width: none;
        }
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
