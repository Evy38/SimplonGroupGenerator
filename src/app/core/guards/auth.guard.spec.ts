import { TestBed } from '@angular/core/testing';
import {
  CanActivateFn,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  const fakeRoute = {
    data: {},
  } as ActivatedRouteSnapshot;

  const fakeState = {
    url: '/dashboard',
  } as RouterStateSnapshot;

  const runGuard = () =>
    TestBed.runInInjectionContext(() => authGuard(fakeRoute, fakeState));

  beforeEach(() => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('devrait refuser l’accès si utilisateur non connecté', () => {
    mockAuthService.isAuthenticated.and.returnValue(false);

    const result = runGuard();

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });

  it('devrait autoriser l’accès si connecté sans rôle requis', () => {
    mockAuthService.isAuthenticated.and.returnValue(true);
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => ({ role: 'formateur' }),
    });

    const result = runGuard();

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('devrait refuser l’accès si rôle incorrect', () => {
    fakeRoute.data = { expectedRole: 'formateur' };
    mockAuthService.isAuthenticated.and.returnValue(true);
    // Mauvais rôle ici pour déclencher le refus
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => ({ role: 'apprenant' }),
    });

    const result = runGuard();

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });

  it('devrait autoriser l’accès si rôle correct', () => {
    fakeRoute.data = { expectedRole: 'formateur' };
    mockAuthService.isAuthenticated.and.returnValue(true);
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => ({ role: 'formateur' }),
    });

    const result = runGuard();

    expect(result).toBeTrue();
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

    it('devrait refuser l’accès si utilisateur connecté mais sans données (null)', () => {
    fakeRoute.data = { expectedRole: 'formateur' };
    mockAuthService.isAuthenticated.and.returnValue(true);

    // Simule un utilisateur inexistant (par exemple, données corrompues ou mal initialisées)
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => null,
    });

    const result = runGuard();

    expect(result).toBeFalse();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth']);
  });

});
