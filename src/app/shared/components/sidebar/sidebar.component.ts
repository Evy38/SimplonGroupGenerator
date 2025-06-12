// src/app/shared/components/sidebar/sidebar.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Pour routerLink, routerLinkActive

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule ], 
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})

export class SidebarComponent {
  constructor(
    private authService: AuthService,
    private router: Router // Injecte Router
  ) {}

  logout(): void {
    this.authService.logout(); // Ou le nom de ta méthode de déconnexion
    // La redirection est gérée dans le service ou ici après le logout
    // this.router.navigate(['/login']); // Si tu veux rediriger depuis ici
  }

  navigateToProfile(): void {
    this.router.navigate(['/profil']); // Navigue vers la route /profil
  }
}