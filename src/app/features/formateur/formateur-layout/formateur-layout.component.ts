// src/app/features/formateur/formateur-layout/formateur-layout.component.ts
import { Component, HostListener } from '@angular/core';
import { RouterModule } from '@angular/router'; // Pour <router-outlet>
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component'; // Importer la sidebar
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-formateur-layout',
  standalone: true,
  imports: [
    RouterModule,       // Nécessaire pour <router-outlet>
    SidebarComponent,
    CommonModule    // Importer et déclarer le composant sidebar
  ],
  templateUrl: './formateur-layout.component.html',
  styleUrls: ['./formateur-layout.component.css']
})


export class FormateurLayoutComponent {
  isSidebarOpen: boolean = false; // Par défaut, la sidebar est fermée sur mobile
  private screenWidth: number;

  constructor() {
    this.screenWidth = window.innerWidth;
    this.checkScreenWidth(); // Vérifier à l'initialisation
  }

  // Écouter les changements de taille de la fenêtre
  @HostListener('window:resize', ['$event'])
  onResize(event?: Event) {
    this.screenWidth = window.innerWidth;
    this.checkScreenWidth();
  }

  // Logique pour déterminer si la sidebar doit être ouverte par défaut sur grand écran
  private checkScreenWidth(): void {
    if (this.screenWidth >= 768) { // Point de rupture pour tablette
      this.isSidebarOpen = true; // Sidebar ouverte par défaut sur grand écran
    } else {
      // Sur mobile, on garde l'état actuel (si l'utilisateur l'a ouverte/fermée)
      // ou on la ferme par défaut si on vient de passer en dessous du breakpoint
      // Si tu veux qu'elle se ferme toujours en passant sur mobile :
      // this.isSidebarOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}