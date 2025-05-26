// src/app/features/formateur/brief-detail/brief-detail.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing'; // Ajout de fakeAsync et tick
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { PromoService } from '../../../core/services/promo.service';
import { BriefService } from '../../../core/services/brief.service';
import { BriefDetailComponent } from './brief-detail.component';
// Si BriefDetailComponent est standalone et importe CommonModule, FormsModule, etc.,
// on n'a pas forcément besoin de les réimporter ici dans le TestBed.

// Mocks pour les services (gardons-les car ils fonctionnent bien pour les données)
class MockPromoService {
  getPromoById(id: string) {
    // console.log(`MockPromoService: getPromoById called with ${id}`);
    if (id === 'mockPromoId1') {
      return of({ id: 'mockPromoId1', name: 'Mock Promo', members: [] });
    }
    return of(undefined);
  }
  promos$ = of([]);
}

class MockBriefService {
  getBriefById(id: string) {
    // console.log(`MockBriefService: getBriefById called with ${id}`);
    if (id === 'mockBriefId123') {
      return of({ id: 'mockBriefId123', name: 'Mock Brief', description: 'Desc', sourceGroupId: 'mockPromoId1' });
    }
    return of(undefined);
  }
  briefs$ = of([]);
}

describe('BriefDetailComponent', () => {
  let component: BriefDetailComponent;
  let fixture: ComponentFixture<BriefDetailComponent>;
  let mockActivatedRoute: any;
  let router: Router; // Pour espionner la méthode navigate

  beforeEach(async () => {
    mockActivatedRoute = {
      paramMap: of(convertToParamMap({ id: 'mockBriefId123' }))
    };

    await TestBed.configureTestingModule({
      imports: [
        BriefDetailComponent,
        RouterTestingModule.withRoutes([]), // Essentiel pour les RouterLink et l'infrastructure du routeur
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        // PAS de MockRouter fourni via useClass ici, laissons RouterTestingModule fournir le Router
        { provide: PromoService, useClass: MockPromoService },
        { provide: BriefService, useClass: MockBriefService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BriefDetailComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router); // Récupérer l'instance du Router fournie par RouterTestingModule
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true)); // Espionner la méthode navigate
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load brief and promo details on init', fakeAsync(() => { // Utilise fakeAsync pour gérer les observables
    fixture.detectChanges(); // Déclenche ngOnInit
    tick(); // Avance l'horloge virtuelle pour que les observables émettent

    // Vérifier que les observables du composant ont les bonnes données
    // après que les appels aux services (mockés) aient eu lieu et que les pipes RxJS aient traité les données
    interface ViewData {
      brief: { id: string; name: string; description: string; sourceGroupId: string };
      sourceGroup: { id: string; name: string; members: any[] };
    }
    let viewDataResult: ViewData | undefined;
    component.viewData$.subscribe(data => viewDataResult = data as ViewData);
    tick(); // Encore un tick si nécessaire pour la propagation dans combineLatest

    expect(viewDataResult).toBeTruthy();
    if (viewDataResult) {
        expect(viewDataResult.brief.id).toBe('mockBriefId123');
        expect(viewDataResult.brief.name).toBe('Mock Brief');
        expect(viewDataResult.sourceGroup.id).toBe('mockPromoId1');
        expect(viewDataResult.sourceGroup.name).toBe('Mock Promo');
    }
  }));

  it('should have a back link to the briefs list', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const backLink = compiled.querySelector('a[routerLink="/formateur/briefs"]');
    expect(backLink).toBeTruthy();
    // Avec RouterTestingModule, l'attribut href devrait être correctement généré
    expect(backLink?.getAttribute('href')).toBe('/formateur/briefs');
  });

  it('should navigate to briefs list if brief is not found', fakeAsync(() => {
    // Surcharger le mock d'ActivatedRoute pour ce test spécifique pour simuler un ID non trouvé
    // ou mieux, surcharger le mockBriefService pour qu'il retourne undefined
    const briefService = TestBed.inject(BriefService) as unknown as MockBriefService; // Récupère le mock
    spyOn(briefService, 'getBriefById').and.returnValue(of(undefined)); // Faire en sorte que le brief ne soit pas trouvé

    fixture.detectChanges(); // Déclenche ngOnInit
    tick(); // Laisser le temps aux observables de se résoudre

    expect(router.navigate).toHaveBeenCalledWith(['/formateur/briefs']);
  }));
});