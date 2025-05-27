// src/app/features/apprenant/components/apprenant-sidebar/apprenant-sidebar.component.ts
import { Component, Input, HostListener, Output, EventEmitter, OnInit } from '@angular/core'; // Ajout de HostListener, Output, EventEmitter ici
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; // Pour @if dans son template
import { AuthService } from '../../../../core/services/auth.service'; // Ajuste

@Component({
  selector: 'app-apprenant-sidebar', // Le sélecteur que ApprenantLayoutComponent utilise
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './apprenant-sidebar.component.html',
  // IMPORTANT: Utilise les MÊMES styles que ta sidebar partagée si le look doit être identique.
  // Si tu avais 'sidebar.component.css' pour le formateur, utilise-le.
  // Ou si 'apprenant-sidebar.component.css' est une copie exacte avec juste les liens qui changent, c'est bon.
  styleUrls: [
    '../../../../shared/components/sidebar/sidebar.component.css', // SI TU VEUX LE MÊME LOOK QUE CELLE DU FORMATEUR
    // './apprenant-sidebar.component.css' // Ou tes styles spécifiques s'ils sont déjà comme tu veux
  ]
})
export class ApprenantSidebarComponent implements OnInit { // Ou SidebarComponent
  // isSidebarOpen = false;
  @Input() isOpen: boolean = false;
  isMobileView = false;
  private readonly screenWidthThreshold = 768; // Assure-toi que cette valeur est cohérente

  @Output() sidebarToggled = new EventEmitter<boolean>();

  constructor(
    private authService: AuthService, // S'assurer que AuthService est importé
    private router: Router // S'assurer que Router est importé
  ) {}

  // ... ngOnInit, onWindowResize, checkScreenWidth, toggle, emitSidebarState, logout ...
  // que nous avons déjà définis.

  // VÉRIFIE QUE LES AUTRES MÉTHODES SONT PRÉSENTES ET CORRECTES.
  // PAR EXEMPLE :
  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.checkScreenWidth();
      if (this.isMobileView) {
        this.isOpen = false;
      } else {
        this.isOpen = true; // Ou false selon ton design desktop par défaut
      }
      this.emitSidebarState(); // Émettre l'état initial
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined') {
      const oldIsMobileView = this.isMobileView;
      this.checkScreenWidth();

      if (oldIsMobileView !== this.isMobileView) {
        if (this.isMobileView) {
          this.isOpen = false;
        } else {
          this.isOpen = true; // Ou false si elle ne doit pas s'ouvrir auto sur desktop
        }
        this.emitSidebarState();
      }
    }
  }

  private checkScreenWidth(): void {
    this.isMobileView = window.innerWidth < this.screenWidthThreshold;
  }

  toggle(): void {
    this.isOpen = !this.isOpen;
    this.emitSidebarState();
  }

  private emitSidebarState(): void {
    this.sidebarToggled.emit(this.isOpen);
  }

  logout(): void {
    this.authService.logout();
    if (this.isMobileView && this.isOpen) {
      this.toggle();
    }
  }

  // === AJOUT DE LA MÉTHODE onLinkClick ===
  onLinkClick(): void {
    // Si on est en mode mobile ET que la sidebar est actuellement ouverte,
    // alors on la ferme (en appelant toggle).
    if (this.isMobileView && this.isOpen) {
      this.toggle();
    }
  }
  // === FIN DE L'AJOUT ===
}