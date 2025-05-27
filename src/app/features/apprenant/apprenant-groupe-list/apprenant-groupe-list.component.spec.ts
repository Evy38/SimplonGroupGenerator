import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantGroupeListComponent } from './apprenant-groupe-list.component';

describe('ApprenantGroupeListComponent', () => {
  let component: ApprenantGroupeListComponent;
  let fixture: ComponentFixture<ApprenantGroupeListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantGroupeListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantGroupeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
