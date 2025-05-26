// src/app/features/formateur/brief-list/brief-list.component.spec.ts
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import { BriefListComponent } from './brief-list.component';
import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';
import { Brief } from '../../../core/services/models/brief.model'; // Correction du chemin si nécessaire
import { Group } from '../../../core/services/models/group.model';   // Correction du chemin si nécessaire

// Utilisation de Subjects pour contrôler les émissions des observables des services
const mockBriefsSubject = new Subject<Brief[]>();
const mockPromosSubject = new Subject<Group[]>();

// Variable pour stocker la dernière valeur des briefs pour les mocks
// On la définit ici pour qu'elle soit accessible dans la portée de la classe MockBriefService
let mockBriefsSubject_lastValue: Brief[] = [];

class MockBriefService {
  briefs$ = mockBriefsSubject.asObservable();

  addBrief = jasmine.createSpy('addBrief').and.callFake((briefData: Omit<Brief, 'id'>) => {
    const newBrief: Brief = { ...briefData, id: `new-${Date.now()}-${Math.random()}` }; // ID un peu plus unique
    const currentBriefs = [...mockBriefsSubject_lastValue]; // Nouvelle copie pour l'immutabilité
    const updatedBriefs = [...currentBriefs, newBrief];
    mockBriefsSubject_lastValue = updatedBriefs; // Mettre à jour la variable de suivi
    mockBriefsSubject.next(updatedBriefs);     // Émettre la nouvelle liste
    // Simuler le retour du brief créé si ton composant l'utilise (sinon, peut être void)
    return newBrief;
  });

  // Si updateBrief est utilisé par le composant, il faut le mocker aussi.
  // Pour l'instant, on se concentre sur ce qui est testé.
  // updateBrief = jasmine.createSpy('updateBrief')...

  deleteBrief = jasmine.createSpy('deleteBrief').and.callFake((briefId: string) => {
    const updatedBriefs = mockBriefsSubject_lastValue.filter(b => b.id !== briefId);
    mockBriefsSubject_lastValue = updatedBriefs; // Mettre à jour la variable de suivi
    mockBriefsSubject.next(updatedBriefs);     // Émettre la nouvelle liste
    // Si la méthode de service réelle retourne quelque chose (ex: Observable<void>), mocker cela.
  });
}

class MockPromoService {
  promos$ = mockPromosSubject.asObservable();
}

describe('BriefListComponent', () => {
  let component: BriefListComponent;
  let fixture: ComponentFixture<BriefListComponent>;
  let briefService: MockBriefService; // Typer avec la classe mock pour l'accès aux spies
  // let promoService: MockPromoService; // Si on a besoin d'espionner PromoService

  const initialMockBriefsData: Brief[] = [
    { id: 'b1', name: 'Brief Test 1', description: 'Description du Brief 1', sourceGroupId: 'p1', imageUrl: 'img1.png' },
    { id: 'b2', name: 'Brief Test 2', description: 'Description du Brief 2', sourceGroupId: 'p2', imageUrl: 'img2.png' }
  ];
  const initialMockPromosData: Group[] = [
    { id: 'p1', name: 'Promo Test Alpha', members: [] },
    { id: 'p2', name: 'Promo Test Beta', members: [] }
  ];

  beforeEach(async () => {
    // Réinitialiser la dernière valeur des subjects avec des copies profondes
    mockBriefsSubject_lastValue = JSON.parse(JSON.stringify(initialMockBriefsData));
    // mockPromosSubject_lastValue n'est pas directement modifié par les mocks ici,
    // mais c'est une bonne pratique si on ajoutait des méthodes à MockPromoService.

    await TestBed.configureTestingModule({
      imports: [
        BriefListComponent, // Le composant est standalone et importe FormsModule, CommonModule, RouterModule
        RouterTestingModule.withRoutes([]) // Essentiel pour les [routerLink]
      ],
      providers: [
        { provide: BriefService, useClass: MockBriefService },
        { provide: PromoService, useClass: MockPromoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BriefListComponent);
    component = fixture.componentInstance;
    // Récupère les instances mockées pour pouvoir vérifier les appels (spies)
    briefService = TestBed.inject(BriefService) as unknown as MockBriefService;
    // promoService = TestBed.inject(PromoService) as unknown as MockPromoService;

    // Émettre les valeurs initiales APRÈS la création du composant
    // et AVANT le premier fixture.detectChanges() qui déclenche ngOnInit.
    mockBriefsSubject.next(mockBriefsSubject_lastValue);
    mockPromosSubject.next(JSON.parse(JSON.stringify(initialMockPromosData))); // Émettre une copie

    fixture.detectChanges(); // Déclenche ngOnInit, les abonnements du composant, et le premier rendu.
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display initial briefs from briefs$', fakeAsync(() => {
    // Le premier detectChanges dans beforeEach a déjà déclenché ngOnInit et l'abonnement initial.
    // Les données devraient être disponibles pour le pipe async.

    tick(); // Permet aux micro-tâches (pipe async) de se terminer
    fixture.detectChanges(); // Mettre à jour la vue avec les données des observables

    const briefCards = fixture.debugElement.queryAll(By.css('.brief-card'));
    expect(briefCards.length).toBe(initialMockBriefsData.length); // Doit être 2

    if (initialMockBriefsData.length > 0) {
      const firstCardNameEl = briefCards[0].query(By.css('.brief-name'));
      expect(firstCardNameEl).toBeTruthy();
      expect(firstCardNameEl.nativeElement.textContent).toContain(initialMockBriefsData[0].name);

      const firstCardDescEl = briefCards[0].query(By.css('.brief-description'));
      expect(firstCardDescEl).toBeTruthy();
      // Utiliser slice comme dans le template pour la comparaison
      const expectedDesc = initialMockBriefsData[0].description.slice(0,70) + (initialMockBriefsData[0].description.length > 70 ? '...' : '');
      expect(firstCardDescEl.nativeElement.textContent).toContain(expectedDesc);
    }
  }));

  describe('Create/Edit Brief Modal', () => {
    it('should open create brief modal when "openCreateBriefModal" is called', () => {
      component.openCreateBriefModal();
      fixture.detectChanges(); // Pour que la modale apparaisse dans le DOM

      expect(component.isCreateBriefModalOpen).toBeTrue();
      expect(component.isEditMode).toBeFalse();
      expect(component.currentBriefData.id).toBeNull();

      const modal = fixture.debugElement.query(By.css('.modal-overlay.full-screen-modal-overlay'));
      expect(modal).toBeTruthy();
      const modalTitle = modal.query(By.css('.modal-header h2')).nativeElement.textContent;
      expect(modalTitle).toContain('Créer un Nouveau Brief');
    });

    it('should open edit brief modal with brief data when "openEditBriefModal" is called', () => {
      const briefToEdit = initialMockBriefsData[0];
      component.openEditBriefModal(briefToEdit);
      fixture.detectChanges();

      expect(component.isCreateBriefModalOpen).toBeTrue();
      expect(component.isEditMode).toBeTrue();
      expect(component.currentBriefData.id).toBe(briefToEdit.id);
      expect(component.currentBriefData.name).toBe(briefToEdit.name);

      const modalTitle = fixture.debugElement.query(By.css('.modal-header h2')).nativeElement.textContent;
      expect(modalTitle).toContain('Modifier le Brief');
    });

    it('should close create/edit modal when "closeCreateBriefModal" is called', () => {
      component.openCreateBriefModal();
      fixture.detectChanges();
      component.closeCreateBriefModal();
      fixture.detectChanges();

      expect(component.isCreateBriefModalOpen).toBeFalse();
      const modal = fixture.debugElement.query(By.css('.modal-overlay.full-screen-modal-overlay'));
      expect(modal).toBeFalsy(); // La modale ne doit plus être dans le DOM
    });

    it('should call briefService.addBrief when submitting create form with valid data', fakeAsync(() => {
      component.openCreateBriefModal();
      fixture.detectChanges();

      // Remplir les données du formulaire via la propriété du composant (comme le fait ngModel)
      component.currentBriefData = {
        id: null,
        name: 'Nouveau Brief Valide',
        description: 'Description valide',
        imageUrl: '',
        sourceGroupId: 'p1', // ID d'une promo mockée
        assignedGroupId: null
      };
      fixture.detectChanges(); // Nécessaire si des logiques dépendent des valeurs dans le template avant soumission

      // Simuler la soumission du formulaire
      // Si le bouton de soumission est de type="submit" dans un <form (ngSubmit)="...">
      const form = fixture.debugElement.query(By.css('form.create-brief-form'));
      expect(form).toBeTruthy("Le formulaire de création de brief n'a pas été trouvé.");
      form.triggerEventHandler('ngSubmit', null);

      tick(); // Pour la logique asynchrone dans onSaveBriefSubmit (ex: this.formSuccess)
      // Si onSaveBriefSubmit a un setTimeout pour fermer la modale:
      tick(2000); // Ajuster au délai du setTimeout

      expect(briefService.addBrief).toHaveBeenCalledWith(jasmine.objectContaining({
        name: 'Nouveau Brief Valide',
        description: 'Description valide',
        sourceGroupId: 'p1'
      }));
      expect(component.isCreateBriefModalOpen).toBeFalse(); // La modale doit se fermer après le setTimeout
    }));

    it('should display form error if name is missing on submit', () => {
      component.openCreateBriefModal();
      // Ne pas mettre de nom
      component.currentBriefData.description = 'Description valide';
      component.currentBriefData.sourceGroupId = 'p1';
      fixture.detectChanges();

      component.onSaveBriefSubmit(); // Appeler directement la méthode
      fixture.detectChanges();

      expect(component.formError).toBe("Le nom et la description du brief sont obligatoires.");
      expect(briefService.addBrief).not.toHaveBeenCalled();
      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain("Le nom et la description du brief sont obligatoires.");
    });

    // TODO: Ajouter un test pour la soumission en mode édition (appel à updateBrief)
    // TODO: Ajouter un test pour l'erreur si sourceGroupId est manquant lors de la soumission
  });

  describe('Delete Brief Modal', () => {
    it('should open confirm delete modal with correct data', () => {
      const briefToDelete = initialMockBriefsData[0];
      const mockEvent = { stopPropagation: jasmine.createSpy('stopPropagation') } as any;
      component.openConfirmDeleteModal(briefToDelete.id, briefToDelete.name, mockEvent);
      fixture.detectChanges();

      expect(component.isConfirmDeleteModalOpen).toBeTrue();
      expect(component.briefToDeleteId).toBe(briefToDelete.id);
      expect(component.briefNameToDelete).toBe(briefToDelete.name);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      const modal = fixture.debugElement.query(By.css('.confirm-delete-modal-overlay'));
      expect(modal).toBeTruthy();
    });

    it('should close confirm delete modal', () => {
      component.openConfirmDeleteModal(initialMockBriefsData[0].id, initialMockBriefsData[0].name, { stopPropagation: () => {} } as any);
      fixture.detectChanges(); // Ouvre la modale
      component.closeConfirmDeleteModal();
      fixture.detectChanges(); // Ferme la modale

      expect(component.isConfirmDeleteModalOpen).toBeFalse();
    });

    it('should call briefService.deleteBrief when deletion is confirmed', fakeAsync(() => {
      const briefToDelete = initialMockBriefsData[0];
      component.openConfirmDeleteModal(briefToDelete.id, briefToDelete.name, { stopPropagation: () => {} } as any);
      fixture.detectChanges(); // Ouvre la modale

      component.confirmDeleteBrief();
      // S'il y a un setTimeout pour réinitialiser le message de succès/erreur
      tick(2500); // Ajuster au délai du setTimeout dans confirmDeleteBrief

      expect(briefService.deleteBrief).toHaveBeenCalledWith(briefToDelete.id);
      expect(component.isConfirmDeleteModalOpen).toBeFalse(); // La modale de confirmation doit se fermer
    }));
  });
});