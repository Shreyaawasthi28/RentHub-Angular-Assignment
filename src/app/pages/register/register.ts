
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  name = '';
  email = '';
  password = '';
  message = '';

  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  register(): void {
    const cleanName = this.name.trim();
    const cleanEmail = this.email.trim();

    if (!cleanName || !cleanEmail || !this.password) {
      this.message = 'Please fill in all fields.';
      return;
    }

    if (this.password.length < 6) {
      this.message = 'Password must be at least 6 characters.';
      return;
    }

    const result = this.authService.register(
      cleanName,
      cleanEmail,
      this.password
    );

    if (result === 'duplicate') {
      this.message = 'This email is already registered. Please login.';
      return;
    }

    this.router.navigate(['/login']);
  }
}
