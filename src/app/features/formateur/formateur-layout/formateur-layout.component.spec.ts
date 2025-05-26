// src/app/features/formateur/formateur-layout/formateur-layout.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { FormateurLayoutComponent } from './formateur-layout.component';
// SidebarComponent est importé par FormateurLayoutComponent (standalone), donc pas besoin ici directement

describe('FormateurLayoutComponent', () => {
  let component: FormateurLayoutComponent;
  let fixture: ComponentFixture<FormateurLayoutComponent>;
  // Déclarer le spy ici pour qu'il soit accessible dans toute la suite
  let windowInnerWidthSpy: jasmine.Spy<() => number>;

  // Fonction pour configurer la largeur de l'écran AVANT la création du composant
  function setupInitialScreenWidth(width: number) {
    // Assurer que le spy est configuré pour retourner la bonne valeur
    windowInnerWidthSpy.and.returnValue(width);
  }

  // Fonction pour simuler un redimensionnement APRÈS que le composant est initialisé
  function simulateResize(width: number) {
    windowInnerWidthSpy.and.returnValue(width); // Mettre à jour la valeur retournée
    window.dispatchEvent(new Event('resize'));  // Déclencher l'événement
    fixture.detectChanges();                    // Mettre à jour le composant
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormateurLayoutComponent, RouterTestingModule.withRoutes([])],
    }).compileComponents();

    // Créer le spy sur window.innerWidth UNE SEULE FOIS ici
    // et le garder pour pouvoir le reconfigurer.
    // 'get' est important pour espionner un getter.
    windowInnerWidthSpy = spyOnProperty(window, 'innerWidth', 'get');

    // La création de fixture et component se fera dans chaque test ou sous-describe
    // après avoir configuré la largeur d'écran initiale.
  });

  it('should create', () => {
    setupInitialScreenWidth(1024); // Simuler grand écran
    fixture = TestBed.createComponent(FormateurLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('Sidebar Toggling and Display on Init', () => {
    it('should initialize isSidebarOpen to true on large screen (>= 768px)', () => {
      setupInitialScreenWidth(800);
      fixture = TestBed.createComponent(FormateurLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges(); // Déclenche constructor -> ngOnInit -> checkScreenWidth
      expect(component.isSidebarOpen).toBeTrue();
    });

    it('should initialize isSidebarOpen to false on small screen (< 768px)', () => {
      setupInitialScreenWidth(500);
      fixture = TestBed.createComponent(FormateurLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges(); // Déclenche constructor -> ngOnInit -> checkScreenWidth
      // Selon la logique: isSidebarOpen = false (défaut) -> checkScreenWidth(500) -> la condition if est fausse -> else ne fait rien. Donc reste false.
      expect(component.isSidebarOpen).toBeFalse();
    });
  });

  describe('Sidebar toggleSidebar() method', () => {
    beforeEach(() => {
        setupInitialScreenWidth(800); // Commence grand, sidebar ouverte par défaut
        fixture = TestBed.createComponent(FormateurLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('toggleSidebar() should toggle isSidebarOpen state correctly', () => {
      expect(component.isSidebarOpen).toBeTrue(); // Initialement ouvert

      component.toggleSidebar();
      fixture.detectChanges();
      expect(component.isSidebarOpen).toBeFalse();

      component.toggleSidebar();
      fixture.detectChanges();
      expect(component.isSidebarOpen).toBeTrue();
    });

    it('sidebar toggle button should call toggleSidebar() on click', () => {
        spyOn(component, 'toggleSidebar').and.callThrough();
        const toggleButton = fixture.debugElement.query(By.css('.sidebar-toggle-button'));
        expect(toggleButton).toBeTruthy();
        toggleButton.triggerEventHandler('click', null);
        expect(component.toggleSidebar).toHaveBeenCalled();
      });

    it('sidebar should have "open" class when isSidebarOpen is true and not when false', () => {
        expect(component.isSidebarOpen).toBeTrue(); // Vérif état initial après init sur grand écran
        let sidebarEl = fixture.debugElement.query(By.css('app-sidebar.formateur-sidebar'));
        expect(sidebarEl.classes['open']).toBeTrue();

        component.toggleSidebar();
        fixture.detectChanges();
        expect(component.isSidebarOpen).toBeFalse();
        sidebarEl = fixture.debugElement.query(By.css('app-sidebar.formateur-sidebar')); // Re-query
        expect(sidebarEl.classes['open']).toBeFalsy('Sidebar should NOT have "open" class when isSidebarOpen is false');
      });
  });


  describe('@HostListener(window:resize)', () => {
    beforeEach(() => {
      // Initialiser le composant pour chaque test de redimensionnement
      // La largeur initiale ici n'est pas critique car on va la changer immédiatement.
      setupInitialScreenWidth(1024); // Commencer sur grand écran pour un état prévisible
      fixture = TestBed.createComponent(FormateurLayoutComponent);
      component = fixture.componentInstance;
      fixture.detectChanges(); // Important pour que le @HostListener soit actif
    });

    it('should set isSidebarOpen to true on resize from small to large screen', () => {
      simulateResize(500); // Passe à petit écran
      component.isSidebarOpen = false; // L'utilisateur la ferme (ou elle était déjà fermée)
      fixture.detectChanges();
      expect(component.isSidebarOpen).toBeFalse();

      simulateResize(1024); // Redimensionner vers grand écran
      expect(component.isSidebarOpen).toBeTrue();
    });

    it('should keep isSidebarOpen as false on resize from large to small screen if it was manually closed', () => {
      expect(component.isSidebarOpen).toBeTrue(); // Init sur grand écran
      component.toggleSidebar(); // L'utilisateur la ferme
      fixture.detectChanges();
      expect(component.isSidebarOpen).toBeFalse();

      simulateResize(500); // Redimensionner vers petit écran
      expect(component.isSidebarOpen).toBeFalse();
    });

    it('should keep isSidebarOpen as true if it was true (e.g., user opened it on small screen, or was on large) and screen remains/becomes large', () => {
      simulateResize(500); // Commence petit
      component.isSidebarOpen = true; // L'utilisateur l'ouvre
      fixture.detectChanges();
      expect(component.isSidebarOpen).toBeTrue();

      simulateResize(800); // Devient grand
      expect(component.isSidebarOpen).toBeTrue();

      simulateResize(900); // Reste grand
      expect(component.isSidebarOpen).toBeTrue();
    });

    it('should keep isSidebarOpen as true when resizing from large to small screen if it was already open (current component logic)', () => {
      // Initialement sur grand écran (1024px), isSidebarOpen est true
      expect(component.isSidebarOpen).toBeTrue();

      simulateResize(500); // Passe à petit écran
      // La logique checkScreenWidth ne change pas isSidebarOpen si < 768px
      expect(component.isSidebarOpen).toBeTrue();
    });
  });
});