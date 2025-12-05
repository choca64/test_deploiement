import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterPage {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  displayName = '';
  ville = '';
  promo = '';
  
  isLoading = false;
  error = '';
  step = 1; // 1 = infos compte, 2 = infos profil

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Rediriger si déjà connecté
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/talents']);
    }
  }

  nextStep(): void {
    // Validation étape 1
    if (!this.username || !this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs obligatoires';
      return;
    }

    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.error = '';
    this.step = 2;
  }

  previousStep(): void {
    this.step = 1;
  }

  async onSubmit(): Promise<void> {
    this.isLoading = true;
    this.error = '';

    try {
      await this.authService.register({
        email: this.email,
        password: this.password,
        username: this.username,
        displayName: this.displayName || this.username,
        ville: this.ville,
        promo: this.promo
      });

      this.router.navigate(['/talents']);
    } catch (err: any) {
      this.error = err.error?.message || 'Erreur lors de l\'inscription';
    } finally {
      this.isLoading = false;
    }
  }
}

