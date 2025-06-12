import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ApprenantGroupeListComponent } from './apprenant-groupe-list.component';
import { AuthService } from '../../../core/services/auth.service';
import { BriefService } from '../../../core/services/brief.service';
import { UserRole, User } from '../../../core/services/models/user.model';
import { Brief } from '../../../core/services/models/brief.model';
import { ActivatedRoute } from '@angular/router';

describe('ApprenantGroupeListComponent', () => {
  let component: ApprenantGroupeListComponent;
  let fixture: ComponentFixture<ApprenantGroupeListComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockBriefService: jasmine.SpyObj<BriefService>;

  const fakeUser: User = {
    id: 'apprenant-id',
    email: 'test@app.com',
    name: 'Test Apprenant',
    role: UserRole.APPRENANT,
    promoId: 'promo1',
    password: 'secret'
  };

  const fakeBriefs: Brief[] = [
    {
      id: 'brief1',
      name: 'Brief 1',
      title: 'Brief 1',
      description: '',
      imageUrl: '',
      promoId: 'promo1',
      sourceGroupId: 'promo1',
      creationDate: new Date(),
      groups: [
        {
          id: 'g1',
          name: 'Groupe 1',
          members: [
            { id: 'apprenant-id', nom: 'Moi', email: '', genre: 'nsp', age: 22, aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 2, profil: 'reserve' },
            { id: 'autre', nom: 'Autre', email: '', genre: 'nsp', age: 25, aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 3, profil: 'alaise' }
          ]
        }
      ]
    }
  ];

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [], { currentUserValue: fakeUser });
    mockBriefService = jasmine.createSpyObj('BriefService', ['getBriefsByPromoId']);

    await TestBed.configureTestingModule({
      imports: [ApprenantGroupeListComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: BriefService, useValue: mockBriefService },
        {
        provide: ActivatedRoute,
        useValue: {
          snapshot: { data: {} }, // tu peux adapter si nécessaire
          params: [],
          queryParams: [],
          fragment: [],
        }
      }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApprenantGroupeListComponent);
    component = fixture.componentInstance;
  });

  // --- TEST 1 ---
  it('devrait afficher un groupe si l’utilisateur est membre d’un sous-groupe', () => {
    mockBriefService.getBriefsByPromoId.and.returnValue(of(fakeBriefs));

    fixture.detectChanges(); // ngOnInit

    expect(component.displayedGroupsInfo.length).toBe(1);
    expect(component.displayedGroupsInfo[0].groupName).toBe('Groupe 1');
    expect(component.errorMessage).toBeNull();
  });

  // --- TEST 2 ---
  it('devrait afficher un message d’erreur si getBriefs échoue', () => {
    mockBriefService.getBriefsByPromoId.and.returnValue(throwError(() => new Error('Oups')));

    fixture.detectChanges(); // ngOnInit

    expect(component.errorMessage).toContain('erreur');
    expect(component.isLoading).toBeFalse();
    expect(component.displayedGroupsInfo.length).toBe(0);
  });
    it('devrait afficher un message d’erreur si l’utilisateur n’a pas de promoId', () => {
    const userSansPromo = {
      ...fakeUser,
      promoId: undefined
    };
    Object.defineProperty(mockAuthService, 'currentUserValue', {
      get: () => userSansPromo
    });

    fixture.detectChanges(); // ngOnInit

    expect(component.errorMessage).toContain('promotion');
    expect(component.isLoading).toBeFalse();
    expect(component.displayedGroupsInfo.length).toBe(0);
    expect(mockBriefService.getBriefsByPromoId).not.toHaveBeenCalled();
  });

});
