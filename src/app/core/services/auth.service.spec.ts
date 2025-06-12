import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { UserRole } from '../../core/services/models/user.model'; // si pas encore fait

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear(); // 👈 Vide le stockage entre chaque test
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should log in with correct credentials', () => {
    const result = service.login('formateur@test.com', 'password');
    expect(result).toBeTrue();
    expect(service.currentUserValue?.email).toBe('formateur@test.com');
  });

  it('should not log in with incorrect credentials', () => {
    const result = service.login('formateur@test.com', 'wrongpass');
    expect(result).toBeFalse();
    expect(service.currentUserValue).toBeNull();
  });

  it('should return true if a user is logged in', () => {
    service.login('formateur@test.com', 'password');
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('should return false if no user is logged in', () => {
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should return true if user has expected role', () => {
    service.login('formateur@test.com', 'password');
    expect(service.hasRole(UserRole.FORMATEUR)).toBeTrue();
  });

  it('should return false if user has different role', () => {
    service.login('apprenant@test.com', 'password');
    expect(service.hasRole(UserRole.FORMATEUR)).toBeFalse(); 
  });

  it('should register a new user if email is not used', () => {
    const result = service.registerUser(
      { name: 'Test', email: 'new@mail.com', password: '1234' },
      UserRole.APPRENANT
    );
    expect(result.success).toBeTrue();
    expect(result.user?.email).toBe('new@mail.com');

    // Pas de connexion auto donc on vérifie juste que currentUser est toujours null
    expect(service.currentUserValue).toBeNull();
  });

  it('should not register a user with existing email', () => {
    const result = service.registerUser(
      { name: 'Dup', email: 'formateur@test.com', password: '1234' },
      UserRole.FORMATEUR
    );
    expect(result.success).toBeFalse();
  });
});
