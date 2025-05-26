import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantLayoutComponent } from './apprenant-layout.component';

describe('ApprenantLayoutComponent', () => {
  let component: ApprenantLayoutComponent;
  let fixture: ComponentFixture<ApprenantLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
