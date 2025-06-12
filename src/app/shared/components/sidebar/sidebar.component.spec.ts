// src/app/shared/components/sidebar/sidebar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
import { AuthService } from '../../../core/services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { provideRouter } from '@angular/router';


class MockAuthService {
  logoutCalled = false;
  currentUser$ = of(null);

  logout(): void {
    this.logoutCalled = true;
  }
}

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let authService: MockAuthService;
  let router: Router;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SidebarComponent
      ],
      providers: [
        { provide: AuthService, useClass: MockAuthService },
        { provide: ActivatedRoute, useValue: {} },
        provideRouter([
      { path: 'promos', component: class DummyPromos {} },
      { path: 'briefs', component: class DummyBriefs {} },
      { path: 'profil', component: class DummyProfil {} }
    ]),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService) as unknown as MockAuthService;
    router = TestBed.inject(Router);
    compiled = fixture.nativeElement as HTMLElement;

    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have correct links with routerLink and href', () => {
    const promosLink = compiled.querySelector('a[routerLink="promos"]');
    expect(promosLink?.getAttribute('href')).toBe('/promos');

    const briefsLink = compiled.querySelector('a[routerLink="briefs"]');
    expect(briefsLink?.getAttribute('href')).toBe('/briefs');
  });

  describe('logout()', () => {
    it('should call authService.logout()', () => {
      component.logout();
      expect(authService.logoutCalled).toBeTrue();
    });

    it('should trigger logout() on button click', () => {
      spyOn(component, 'logout').and.callThrough();
      const logoutButton = fixture.debugElement.queryAll(By.css('button.buttons'))
        .find(btn => btn.nativeElement.querySelector('.button-text')?.textContent.trim() === 'Déconnexion');

      expect(logoutButton).toBeTruthy();
      logoutButton?.triggerEventHandler('click', null);
      expect(component.logout).toHaveBeenCalled();
    });
  });

 describe('Profile Navigation', () => {
  it('should have correct routerLink on profile button', () => {
    const profileButtonDebug = fixture.debugElement.queryAll(By.css('button.buttons'))
      .find(btn => btn.nativeElement.textContent.includes('Profil'));

    expect(profileButtonDebug).toBeTruthy();
    expect(profileButtonDebug?.attributes['routerLink']).toBe('profil');
  });

  it('should navigate to /profil when navigateToProfile() is called', () => {
    component.navigateToProfile();
    expect(router.navigate).toHaveBeenCalledWith(['/profil']);
  });
});

});
