// src/app/features/apprenant/components/apprenant-sidebar/apprenant-sidebar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { ApprenantSidebarComponent } from './apprenant-sidebar.component';
import { AuthService } from '../../../../core/services/auth.service';

class MockAuthService {
  logoutCalled = false;
  currentUser$ = of(null);

  logout(): void {
    this.logoutCalled = true;
  }
}

describe('ApprenantSidebarComponent', () => {
  let component: ApprenantSidebarComponent;
  let fixture: ComponentFixture<ApprenantSidebarComponent>;
  let authService: MockAuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApprenantSidebarComponent,
        RouterTestingModule.withRoutes([
          { path: 'apprenant/mes-briefs', component: class DummyComponent {} },
          { path: 'apprenant/mes-groupes', component: class DummyComponent {} },
          { path: 'apprenant/profil', component: class DummyComponent {} },
        ])
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApprenantSidebarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call logout() when the button is clicked', () => {
    spyOn(component, 'logout').and.callThrough();

    const button = fixture.debugElement.queryAll(By.css('button.buttons'))
      .find(el => el.nativeElement.textContent.includes('Déconnexion'));

    expect(button).toBeTruthy();
    button?.triggerEventHandler('click', null);

    expect(component.logout).toHaveBeenCalled();
    expect(authService.logoutCalled).toBeTrue();
  });

  it('should have a profile button with routerLink="/apprenant/profil"', () => {
    const button = fixture.debugElement.queryAll(By.css('button.buttons'))
      .find(el => el.nativeElement.textContent.includes('Profil'));

    expect(button?.attributes['ng-reflect-router-link']).toBe('/apprenant/profil');
  });

  it('should render navigation links with correct routes', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const briefs = compiled.querySelector('a[routerLink="/apprenant/mes-briefs"]');
    const groupes = compiled.querySelector('a[routerLink="/apprenant/mes-groupes"]');

    expect(briefs).toBeTruthy();
    expect(groupes).toBeTruthy();
  });
});
