// src/app/features/apprenant/apprenant-layout/apprenant-layout.component.ts
import { Component, HostListener, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ApprenantSidebarComponent } from '../components/apprenant-sidebar/apprenant-sidebar.component';
// CommonModule n'est plus nécessaire pour les imports du composant

@Component({
  selector: 'app-apprenant-layout',
  standalone: true,
  imports: [RouterOutlet, ApprenantSidebarComponent],
  templateUrl: './apprenant-layout.component.html',
  styleUrls: ['./apprenant-layout.component.css'] // CSS spécifique au layout apprenant
})
export class ApprenantLayoutComponent implements OnInit, OnDestroy {
  isLayoutSidebarOpen: boolean = false;
  isMobileView: boolean = false;
 screenWidth: number;

  constructor(private renderer: Renderer2) {
    this.screenWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
  }

 ngOnInit(): void {
  this.screenWidth = window.innerWidth;
  this.updateViewModes();
}


  @HostListener('window:resize', ['$event'])
  onWindowResize(event?: Event): void {
    if (typeof window !== 'undefined') {
      this.screenWidth = window.innerWidth;
      this.updateViewModes();
    }
  }

  private updateViewModes(): void {
    this.isMobileView = this.screenWidth < 768; // Ton breakpoint

    if (!this.isMobileView) { // Si on est sur desktop
      this.isLayoutSidebarOpen = true; // Sidebar toujours "ouverte" (visible) sur desktop
    } else {
      // En mode mobile, l'état initial peut être fermé, ou garder l'état précédent si on redimensionne.
      // Pour la simplicité, on la ferme si on vient de passer en mobile et qu'elle était ouverte.
      if (this.isLayoutSidebarOpen && this.screenWidth < 768) { // Condition un peu redondante avec isMobileView
         // this.isLayoutSidebarOpen = false; // Ou laisse le toggle gérer
      }
    }
    this.updateBodyScrollLock();
  }

  toggleApprenantSidebar(): void {
    this.isLayoutSidebarOpen = !this.isLayoutSidebarOpen;
    this.updateBodyScrollLock();
  }

  private updateBodyScrollLock(): void {
    if (typeof document !== 'undefined') {
      // L'overlay et le no-scroll ne s'appliquent qu'en mode mobile quand la sidebar est ouverte
      if (this.isLayoutSidebarOpen && this.isMobileView) {
        this.renderer.addClass(document.body, 'body-no-scroll');
      } else {
        this.renderer.removeClass(document.body, 'body-no-scroll');
      }
    }
  }

  ngOnDestroy(): void {
    if (typeof document !== 'undefined') {
      this.renderer.removeClass(document.body, 'body-no-scroll');
    }
  }
}