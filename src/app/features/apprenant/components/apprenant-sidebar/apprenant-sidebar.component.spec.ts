import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantSidebarComponent } from './apprenant-sidebar.component';

describe('ApprenantSidebarComponent', () => {
  let component: ApprenantSidebarComponent;
  let fixture: ComponentFixture<ApprenantSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
