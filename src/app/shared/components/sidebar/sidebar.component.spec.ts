// src/app/shared/components/sidebar/sidebar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../core/services/auth.service';

// Mock pour AuthService
class MockAuthService {
  logoutCalled = false;
  currentUser$ = of(null); // Simule qu'aucun utilisateur n'est connecté par défaut

  logout(): void {
    this.logoutCalled = true;
    console.log('MockAuthService: logout() called in test');
  }
}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent, // Le composant est standalone et importe ses propres dépendances (CommonModule, RouterModule)
        RouterTestingModule.withRoutes([
          // Définir des routes factices ici peut aider RouterLinkActive et la génération des href
          // si les tests en dépendent fortement. Pour ce composant, cela semble moins critique
          // que pour un composant qui afficherait <router-outlet>.
          // { path: 'promos', component: class DummyPromosComponent {} },
          // { path: 'briefs', component: class DummyBriefsComponent {} },
          // { path: 'profil', component: class DummyProfilComponent {} },
        ])
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
        // Router est fourni par RouterTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);

    // Espionner router.navigate pour la méthode navigateToProfile() du composant
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture.detectChanges(); // Déclenche ngOnInit et le premier rendu
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have navigation links with correct routerLink attributes and hrefs', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Lien "Mes Promos"
    const promosLink = compiled.querySelector('a[routerLink="promos"]');
    expect(promosLink).toBeTruthy('"Mes Promos" link (a[routerLink="promos"]) should exist');
    // Dans un contexte de test avec withRoutes([]), href sera résolu à la racine.
    expect(promosLink?.getAttribute('href')).toBe('/promos');

    // Lien "Mes Briefs"
    const briefsLink = compiled.querySelector('a[routerLink="briefs"]');
    expect(briefsLink).toBeTruthy('"Mes Briefs" link (a[routerLink="briefs"]) should exist');
    expect(briefsLink?.getAttribute('href')).toBe('/briefs');
  });

  describe('logout() method and button', () => {
    it('should call authService.logout() when component.logout() is invoked', () => {
      component.logout();
      expect(authService.logoutCalled).toBeTrue();
    });

    it('should call component.logout() when the "Déconnexion" button is clicked', () => {
      spyOn(component, 'logout').and.callThrough(); // Espionne la méthode logout du composant

      // Le bouton de déconnexion a la classe "buttons" et contient un span avec le texte "Déconnexion"
      const logoutButton = fixture.debugElement.queryAll(By.css('button.buttons'))
        .find(btnEl => btnEl.nativeElement.querySelector('.button-text')?.textContent.trim() === 'Déconnexion');

      expect(logoutButton).toBeTruthy('Logout button with text "Déconnexion" should exist');
      logoutButton?.triggerEventHandler('click', null);

      expect(component.logout).toHaveBeenCalled();
    });
  });

  describe('Profile Navigation', () => {
    // Le bouton Profil utilise routerLink="profil"

    it('Profile button should have correct routerLink attribute and href', () => {
      const compiled = fixture.nativeElement as HTMLElement;
      // Cible le bouton qui a à la fois la classe "buttons" et l'attribut routerLink="profil"
      const profileButton = compiled.querySelector('button.buttons[routerLink="profil"]');
      expect(profileButton).toBeTruthy('Profile button (button.buttons[routerLink="profil"]) should exist');

      // Vérifier l'attribut routerLink directement
      expect(profileButton?.getAttribute('routerLink')).toBe('profil');
      // Vérifier l'attribut href généré (même pour un bouton, RouterLink peut le générer)
      expect(profileButton?.getAttribute('href')).toBe('/profil');
    });

    // Ce test vérifie la méthode navigateToProfile() du composant,
    // même si elle n'est pas actuellement déclenchée par le bouton Profil (qui utilise routerLink).
    // C'est utile pour s'assurer que la méthode elle-même fonctionne si elle devait être appelée autrement.
    it('navigateToProfile() method should navigate to "/profil"', () => {
      component.navigateToProfile();
      // La méthode du composant appelle this.router.navigate(['/profil'])
      expect(router.navigate).toHaveBeenCalledWith(['/profil']);
    });
  });
});