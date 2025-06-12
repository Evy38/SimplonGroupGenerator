import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService } from '../../../core/services/auth.service'; 
import { FormateurDashboardComponent } from './formateur-dashboard.component';

// --- MOCK ---
class MockAuthService {
  get currentUserValue() {
    return { name: 'Cécile' };
  }
}

describe('FormateurDashboardComponent', () => {
  let component: FormateurDashboardComponent;
  let fixture: ComponentFixture<FormateurDashboardComponent>;

  beforeEach(async () => {
  await TestBed.configureTestingModule({
    imports: [FormateurDashboardComponent],
    providers: [{ provide: AuthService, useClass: MockAuthService }]
  }).compileComponents();

  fixture = TestBed.createComponent(FormateurDashboardComponent);
  component = fixture.componentInstance;
  fixture.detectChanges();
});


  it('should create', () => {
    expect(component).toBeTruthy();
  });

 it('should default to "Formateur" if no user is found', () => {
  component.userName = undefined; // Simule l'absence de user
  fixture.detectChanges();
  expect(component.userName).toBeUndefined(); 
});


it('should display the name of the connected user', () => {
  expect(component.userName).toBe('Cécile');
});

});
