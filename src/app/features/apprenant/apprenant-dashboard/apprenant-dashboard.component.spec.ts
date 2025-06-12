import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprenantDashboardComponent } from './apprenant-dashboard.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserRole, User } from '../../../core/services/models/user.model';

describe('ApprenantDashboardComponent', () => {
  let component: ApprenantDashboardComponent;
  let fixture: ComponentFixture<ApprenantDashboardComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;

  const fakeUser: User = {
    id: 'u1',
    name: 'Jean-Michel',
    email: 'jm@test.com',
    role: UserRole.APPRENANT,
    password: 'password',
    promoId: 'p1'
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: fakeUser
    });

    await TestBed.configureTestingModule({
      imports: [ApprenantDashboardComponent],
      providers: [{ provide: AuthService, useValue: mockAuthService }]
    }).compileComponents();

    fixture = TestBed.createComponent(ApprenantDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show personalized welcome message if user has name', () => {
    expect(component.welcomeMessage).toContain('Jean-Michel');
  });
});
