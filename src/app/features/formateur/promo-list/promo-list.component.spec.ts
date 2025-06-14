import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PromoListComponent } from './promo-list.component';

describe('GroupListComponent', () => {
  let component: PromoListComponent;
  let fixture: ComponentFixture<PromoListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PromoListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PromoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
