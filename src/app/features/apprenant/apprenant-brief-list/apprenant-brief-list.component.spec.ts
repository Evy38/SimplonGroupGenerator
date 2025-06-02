import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApprenantBriefListComponent } from './apprenant-brief-list.component';
import { AuthService } from '../../../core/services/auth.service';
import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';
import { of, throwError } from 'rxjs';
import { UserRole, User } from '../../../core/services/models/user.model';
import { Brief } from '../../../core/services/models/brief.model';
import { Group } from '../../../core/services/models/group.model';

describe('ApprenantBriefListComponent', () => {
  let component: ApprenantBriefListComponent;
  let fixture: ComponentFixture<ApprenantBriefListComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBriefService: jasmine.SpyObj<BriefService>;
  let mockPromoService: jasmine.SpyObj<PromoService>;

  const mockUser: User = {
    id: '1',
    name: 'Apprenant',
    email: 'test@test.com',
    role: UserRole.APPRENANT,
    promoId: 'grpPoneys',
  };

  const mockBriefs: Brief[] = [
    {
      id: 'brief-1',
      name: 'Brief 1',
      title: 'Brief 1',
      description: 'Description',
      imageUrl: '',
      sourceGroupId: 'grpPoneys',
      promoId: 'grpPoneys',
      creationDate: new Date(),
      groups: [],
    },
  ];

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj(
      'AuthService',
      ['currentUserValue'],
      { currentUserValue: mockUser }
    );
    mockBriefService = jasmine.createSpyObj('BriefService', [
      'getBriefsByPromoId',
    ]);
    mockPromoService = jasmine.createSpyObj('PromoService', ['getAllPromos']);

    await TestBed.configureTestingModule({
      imports: [ApprenantBriefListComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: BriefService, useValue: mockBriefService },
        { provide: PromoService, useValue: mockPromoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ApprenantBriefListComponent);
    component = fixture.componentInstance;
  });

  it('devrait créer le composant', () => {
    expect(component).toBeTruthy();
  });

  it('devrait charger les briefs si utilisateur apprenant avec promo', () => {
    mockPromoService.getAllPromos.and.returnValue(of([]));
    mockBriefService.getBriefsByPromoId.and.returnValue(of(mockBriefs));

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.apprenantBriefs.length).toBe(1);
    expect(component.errorMessage).toBeNull();
  });
  it('devrait afficher un message d’erreur si utilisateur apprenant sans promoId', () => {
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => ({ ...mockUser, promoId: undefined }),
    });

    mockPromoService.getAllPromos.and.returnValue(of([]));

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain(
      'informations de promotion manquantes'
    );
  });

  it('devrait afficher une erreur si getAllPromos échoue', () => {
    mockPromoService.getAllPromos.and.returnValue(
      throwError(() => new Error('Erreur promo'))
    );

    component.ngOnInit();

    expect(component.isLoading).toBeFalse();
    expect(component.errorMessage).toContain(
      'Impossible de charger les informations'
    );
  });

  it('devrait ouvrir et fermer la modale de détail', () => {
    const testBrief = mockBriefs[0];
    component.openBriefDetailModal(testBrief);
    expect(component.isBriefDetailModalOpen).toBeTrue();
    expect(component.selectedBriefForModal).toEqual(testBrief);

    component.closeBriefDetailModal();
    expect(component.isBriefDetailModalOpen).toBeFalse();
    expect(component.selectedBriefForModal).toBeNull();
  });
});
