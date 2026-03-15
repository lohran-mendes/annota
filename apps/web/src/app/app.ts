import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AccessLogService } from './core/services/access-log.service';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'annota-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly accessLogService = inject(AccessLogService);
  private readonly authService = inject(AuthService);

  ngOnInit() {
    if (this.authService.isAuthenticated()) {
      this.accessLogService.registerAccess().subscribe();
    }
  }
}
