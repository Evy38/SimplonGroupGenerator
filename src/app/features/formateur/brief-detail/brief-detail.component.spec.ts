import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefDetailComponent } from './brief-detail.component';

describe('BriefDetailComponent', () => {
  let component: BriefDetailComponent;
  let fixture: ComponentFixture<BriefDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BriefDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
