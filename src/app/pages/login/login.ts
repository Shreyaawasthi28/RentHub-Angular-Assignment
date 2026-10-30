
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email = '';
  password = '';
  message = '';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  login(): void {
    if (this.authService.login(this.email, this.password) === 'success') {
      this.router.navigate(['/']);
    } else {
      this.message = 'Incorrect email or password. Please try again.';
    }
  }
}
