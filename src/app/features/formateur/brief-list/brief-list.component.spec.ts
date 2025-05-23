import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BriefListComponent } from './brief-list.component';

describe('BriefListComponent', () => {
  let component: BriefListComponent;
  let fixture: ComponentFixture<BriefListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BriefListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BriefListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
