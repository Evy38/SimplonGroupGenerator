import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantDashboardComponent } from './apprenant-dashboard.component';

describe('ApprenantDashboardComponent', () => {
  let component: ApprenantDashboardComponent;
  let fixture: ComponentFixture<ApprenantDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
