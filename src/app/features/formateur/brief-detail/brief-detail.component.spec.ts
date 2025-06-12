// src/app/features/formateur/brief-detail/brief-detail.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, firstValueFrom } from 'rxjs';
import { BriefDetailComponent } from './brief-detail.component';
import { PromoService } from '../../../core/services/promo.service';
import { BriefService } from '../../../core/services/brief.service';

const mockBrief: {
  id: string;
  name: string;
  title: string;
  description: string;
  promoId: string;
  sourceGroupId: string;
  creationDate: Date; // ✅ Ici on met le type Date
  isValidated: boolean;
  isPublished: boolean;
  isArchived: boolean;
  groups: never[];
} = {
  id: 'mockBriefId1',
  name: 'Mock Brief',
  title: 'Mock Title',
  description: 'Mock Description',
  promoId: 'mockPromoId1',
  sourceGroupId: 'mockPromoId1',
  creationDate: new Date('2024-01-01T00:00:00Z'), // ✅ Ici on met bien la valeur
  isValidated: true,
  isPublished: true,
  isArchived: false,
  groups: []
};



const mockPromo = {
  id: 'mockPromoId1',
  name: 'Mock Promo',
  members: []
};

// --- Mocks pour les services ---
class MockPromoService {
  getPromoById(id: string) {
    return of(id === mockPromo.id ? mockPromo : undefined);
  }
  promos$ = of([]);
}

class MockBriefService {
  getBriefById(id: string) {
    return of(id === mockBrief.id ? mockBrief : undefined);
  }
  briefs$ = of([]);
}

describe('BriefDetailComponent', () => {
  let component: BriefDetailComponent;
  let fixture: ComponentFixture<BriefDetailComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        BriefDetailComponent,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: mockBrief.id })) } },
        { provide: PromoService, useClass: MockPromoService },
        { provide: BriefService, useClass: MockBriefService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BriefDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load brief and promo details on init', fakeAsync(async () => {
    fixture.detectChanges();
    tick();

    const data = await firstValueFrom(component.viewData$);
    expect(data).toBeTruthy();
    expect(data?.brief).toEqual(mockBrief);
    expect(data?.sourceGroup).toEqual(mockPromo);
  }));

  it('should have a back link to the briefs list', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('a[routerLink="/formateur/briefs"]');
    expect(backLink).toBeTruthy();
    expect(backLink?.getAttribute('href')).toBe('/formateur/briefs');
  });

  it('should navigate to briefs list if brief is not found', fakeAsync(() => {
    const briefService = TestBed.inject(BriefService) as unknown as MockBriefService;
    spyOn(briefService, 'getBriefById').and.returnValue(of(undefined));

    fixture.detectChanges();
    tick();

    expect(component.brief).toBeUndefined();
    expect(router.navigate).toHaveBeenCalledWith(['/formateur/briefs']);
  }));
});
