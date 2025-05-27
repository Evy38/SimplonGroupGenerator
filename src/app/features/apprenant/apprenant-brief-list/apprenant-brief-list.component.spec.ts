import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantBriefListComponent } from './apprenant-brief-list.component';

describe('ApprenantBriefListComponent', () => {
  let component: ApprenantBriefListComponent;
  let fixture: ComponentFixture<ApprenantBriefListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantBriefListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantBriefListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
