// src/app/features/formateur/brief-list/brief-list.component.spec.ts
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { BriefListComponent } from './brief-list.component';
import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';
import { Brief } from '../../../core/services/models/brief.model'; // Correction du chemin si nécessaire
import { Group } from '../../../core/services/models/group.model'; // Correction du chemin si nécessaire
import { ActivatedRoute } from '@angular/router';

// Utilisation de Subjects pour contrôler les émissions des observables des services
const mockBriefsSubject = new Subject<Brief[]>();
const mockPromosSubject = new Subject<Group[]>();

// Variable pour stocker la dernière valeur des briefs pour les mocks
// On la définit ici pour qu'elle soit accessible dans la portée de la classe MockBriefService
let mockBriefsSubject_lastValue: Brief[] = [];

class MockBriefService {
  briefs$ = mockBriefsSubject.asObservable();

  addBrief = jasmine
    .createSpy('addBrief')
    .and.callFake((briefData: Omit<Brief, 'id'>) => {
      const newBrief: Brief = {
        ...briefData,
        id: `new-${Date.now()}-${Math.random()}`,
      }; // ID un peu plus unique
      const currentBriefs = [...mockBriefsSubject_lastValue]; // Nouvelle copie pour l'immutabilité
      const updatedBriefs = [...currentBriefs, newBrief];
      mockBriefsSubject_lastValue = updatedBriefs; // Mettre à jour la variable de suivi
      mockBriefsSubject.next(updatedBriefs); // Émettre la nouvelle liste
      // Simuler le retour du brief créé si ton composant l'utilise (sinon, peut être void)
      return newBrief;
    });

  // Si updateBrief est utilisé par le composant, il faut le mocker aussi.
  // Pour l'instant, on se concentre sur ce qui est testé.
  // updateBrief = jasmine.createSpy('updateBrief')...

  deleteBrief = jasmine
    .createSpy('deleteBrief')
    .and.callFake((briefId: string) => {
      const updatedBriefs = mockBriefsSubject_lastValue.filter(
        (b) => b.id !== briefId
      );
      mockBriefsSubject_lastValue = updatedBriefs; // Mettre à jour la variable de suivi
      mockBriefsSubject.next(updatedBriefs); // Émettre la nouvelle liste
      // Si la méthode de service réelle retourne quelque chose (ex: Observable<void>), mocker cela.
    });

  updateBrief = jasmine
    .createSpy('updateBrief')
    .and.callFake((updatedBrief: Brief) => {
      const index = mockBriefsSubject_lastValue.findIndex(
        (b) => b.id === updatedBrief.id
      );
      if (index !== -1) {
        mockBriefsSubject_lastValue[index] = { ...updatedBrief };
        mockBriefsSubject.next([...mockBriefsSubject_lastValue]);
      }
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
    {
      id: 'b1',
      name: 'Brief Test 1',
      description: 'Description du Brief 1',
      sourceGroupId: 'p1',
      imageUrl: 'img1.png',
      title: '',
      promoId: '',
      creationDate: new Date(),
    },
    {
      id: 'b2',
      name: 'Brief Test 2',
      description: 'Description du Brief 2',
      sourceGroupId: 'p2',
      imageUrl: 'img2.png',
      title: '',
      promoId: '',
      creationDate: new Date(),
    },
  ];
  const initialMockPromosData: Group[] = [
    { id: 'p1', name: 'Promo Test Alpha', members: [] },
    { id: 'p2', name: 'Promo Test Beta', members: [] },
  ];

  beforeEach(async () => {
    // Réinitialiser la dernière valeur des subjects avec des copies profondes
    mockBriefsSubject_lastValue = JSON.parse(
      JSON.stringify(initialMockBriefsData)
    );
    // mockPromosSubject_lastValue n'est pas directement modifié par les mocks ici,
    // mais c'est une bonne pratique si on ajoutait des méthodes à MockPromoService.

    await TestBed.configureTestingModule({
      imports: [
        BriefListComponent, // Le composant est standalone et importe FormsModule, CommonModule, RouterModule
      ],
      providers: [
        { provide: BriefService, useClass: MockBriefService },
        { provide: PromoService, useClass: MockPromoService },
        { provide: ActivatedRoute, useValue: {} }
      ],
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
    // ⚠️ Nécessaire pour que la vue s'abonne et que les données arrivent
    mockBriefsSubject.next(mockBriefsSubject_lastValue); // Force la diffusion

    tick(); // Laisse le temps à Angular de propager les valeurs via async pipe
    fixture.detectChanges(); // Rafraîchir la vue

    const briefCards = fixture.debugElement.queryAll(By.css('.brief-card'));
    expect(briefCards.length).toBe(initialMockBriefsData.length); // Devrait être 2

    if (briefCards.length === 0) {
      fail('Aucune carte de brief trouvée');
    }

    const firstCard = briefCards[0];
    const firstCardNameEl = firstCard.query(By.css('.brief-name'));
    expect(firstCardNameEl).toBeTruthy();
    expect(firstCardNameEl.nativeElement.textContent).toContain(
      initialMockBriefsData[0].name
    );

    const firstCardDescEl = firstCard.query(By.css('.brief-description'));
    expect(firstCardDescEl).toBeTruthy();

    const expectedDesc =
      initialMockBriefsData[0].description.slice(0, 70) +
      (initialMockBriefsData[0].description.length > 70 ? '...' : '');
    expect(firstCardDescEl.nativeElement.textContent).toContain(expectedDesc);
  }));

  describe('Create/Edit Brief Modal', () => {
    it('should open create brief modal when "openCreateBriefModal" is called', () => {
      component.openCreateBriefModal();
      fixture.detectChanges(); // Pour que la modale apparaisse dans le DOM

      expect(component.isCreateBriefModalOpen).toBeTrue();
      expect(component.isEditMode).toBeFalse();
      expect(component.currentBriefData.id).toBeNull();

      const modal = fixture.debugElement.query(
        By.css('.modal-overlay.full-screen-modal-overlay')
      );
      expect(modal).toBeTruthy();
      const modalTitle = modal.query(By.css('.modal-header h2')).nativeElement
        .textContent;
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

      const modalTitle = fixture.debugElement.query(By.css('.modal-header h2'))
        .nativeElement.textContent;
      expect(modalTitle).toContain('Modifier le Brief');
    });

    it('should close create/edit modal when "closeCreateBriefModal" is called', () => {
      component.openCreateBriefModal();
      fixture.detectChanges();
      component.closeCreateBriefModal();
      fixture.detectChanges();

      expect(component.isCreateBriefModalOpen).toBeFalse();
      const modal = fixture.debugElement.query(
        By.css('.modal-overlay.full-screen-modal-overlay')
      );
      expect(modal).toBeFalsy(); // La modale ne doit plus être dans le DOM
    });

    it('should call briefService.addBrief when submitting create form with valid data', fakeAsync(() => {
      component.openCreateBriefModal();
      fixture.detectChanges();

      // Remplir les données du formulaire via la propriété du composant (comme le fait ngModel)
      component.currentBriefData = {
        id: null,
        name: 'Nouveau Brief Valide',
        title: 'Nouveau Brief Valide',
        description: 'Description valide',
        imageUrl: '',
        sourceGroupId: 'p1', // ID d'une promo mockée
        promoId: null,
        creationDate: null,
        assignedGroupId: null,
      };
      fixture.detectChanges(); // Nécessaire si des logiques dépendent des valeurs dans le template avant soumission

      // Simuler la soumission du formulaire
      // Si le bouton de soumission est de type="submit" dans un <form (ngSubmit)="...">
      const form = fixture.debugElement.query(By.css('form.create-brief-form'));
      expect(form).toBeTruthy(
        "Le formulaire de création de brief n'a pas été trouvé."
      );
      form.triggerEventHandler('ngSubmit', null);

      tick(); // Pour la logique asynchrone dans onSaveBriefSubmit (ex: this.formSuccess)
      // Si onSaveBriefSubmit a un setTimeout pour fermer la modale:
      tick(2000); // Ajuster au délai du setTimeout

      expect(briefService.addBrief).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Nouveau Brief Valide',
          description: 'Description valide',
          title: 'Nouveau Brief Valide',
          imageUrl: undefined, // ou à adapter selon ton mock
        }),
        'p1', // promoId
        'p1' // sourceGroupId
      );

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

      expect(component.formError).toBe(
        'Le titre et la description du brief sont obligatoires.'
      );
      expect(briefService.addBrief).not.toHaveBeenCalled();
      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent).toContain(
        'Le titre et la description du brief sont obligatoires.'
      );
    });
  });

  describe('Delete Brief Modal', () => {
    it('should open confirm delete modal with correct data', () => {
      const briefToDelete = initialMockBriefsData[0];
      const mockEvent = {
        stopPropagation: jasmine.createSpy('stopPropagation'),
      } as any;
      component.openConfirmDeleteModal(
        briefToDelete.id,
        briefToDelete.name,
        mockEvent
      );
      fixture.detectChanges();

      expect(component.isConfirmDeleteModalOpen).toBeTrue();
      expect(component.briefToDeleteId).toBe(briefToDelete.id);
      expect(component.briefNameToDelete).toBe(briefToDelete.name);
      expect(mockEvent.stopPropagation).toHaveBeenCalled();

      const modal = fixture.debugElement.query(
        By.css('.confirm-delete-modal-overlay')
      );
      expect(modal).toBeTruthy();
    });

    it('should close confirm delete modal', () => {
      component.openConfirmDeleteModal(
        initialMockBriefsData[0].id,
        initialMockBriefsData[0].name,
        { stopPropagation: () => {} } as any
      );
      fixture.detectChanges(); // Ouvre la modale
      component.closeConfirmDeleteModal();
      fixture.detectChanges(); // Ferme la modale

      expect(component.isConfirmDeleteModalOpen).toBeFalse();
    });

    it('should call briefService.deleteBrief when deletion is confirmed', fakeAsync(() => {
      const briefToDelete = initialMockBriefsData[0];
      component.openConfirmDeleteModal(briefToDelete.id, briefToDelete.name, {
        stopPropagation: () => {},
      } as any);
      fixture.detectChanges(); // Ouvre la modale

      component.confirmDeleteBrief();
      // S'il y a un setTimeout pour réinitialiser le message de succès/erreur
      tick(2500); // Ajuster au délai du setTimeout dans confirmDeleteBrief

      expect(briefService.deleteBrief).toHaveBeenCalledWith(briefToDelete.id);
      expect(component.isConfirmDeleteModalOpen).toBeFalse(); // La modale de confirmation doit se fermer
    }));
  });

  it('should call briefService.updateBrief when submitting edit form with valid data', fakeAsync(() => {
    const mockBriefToEdit = {
      id: 'b1',
      title: 'Brief Test 1',
      name: 'Brief Test 1', // si utilisé
      description: 'Description du Brief 1',
      promoId: 'p1',
      sourceGroupId: 'p1',
      assignedGroupId: null,
      creationDate: new Date('2023-01-01'),
      imageUrl: 'https://exemple.com/image.jpg',
    };

    component.isEditMode = true;
    component.currentBriefData = { ...mockBriefToEdit };
    fixture.detectChanges();

    component.onSaveBriefSubmit(); // appelle updateBrief en mode édition
    tick();

    expect(briefService.updateBrief).toHaveBeenCalledWith(
      jasmine.objectContaining({
        id: 'b1',
        title: 'Brief Test 1',
        description: 'Description du Brief 1',
      })
    );
  }));

  it('should display error if sourceGroupId is missing on submit', () => {
    component.openCreateBriefModal();
    fixture.detectChanges();

    // Remplir les champs requis SAUF sourceGroupId
    component.currentBriefData = {
      id: null,
      name: 'Brief sans promo',
      title: 'Brief sans promo',
      description: 'Une description valide',
      imageUrl: '',
      sourceGroupId: null, // Manquant
      promoId: null,
      creationDate: null,
      assignedGroupId: null,
    };
    fixture.detectChanges();

    component.onSaveBriefSubmit();
    fixture.detectChanges();

    expect(component.formError).toBe(
      'Veuillez assigner ce brief à une promo source.'
    );
    expect(briefService.addBrief).not.toHaveBeenCalled();

    const errorMessage = fixture.debugElement.query(By.css('.error-message'));
    expect(errorMessage).toBeTruthy();
    expect(errorMessage.nativeElement.textContent).toContain(
      'Veuillez assigner ce brief à une promo source.'
    );
  });
});
