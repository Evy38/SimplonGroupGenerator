import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormateurLayoutComponent } from './formateur-layout.component';
import { ActivatedRoute, RouterModule } from '@angular/router';

describe('FormateurLayoutComponent', () => {
  let fixture: ComponentFixture<FormateurLayoutComponent>;
  let component: FormateurLayoutComponent;
  let windowInnerWidthSpy: jasmine.Spy;

  beforeAll(() => {
    // Espionner window.innerWidth UNE seule fois pour tous les tests
    windowInnerWidthSpy = spyOnProperty(window, 'innerWidth', 'get');
  });

  async function setupTest(screenWidth: number): Promise<void> {
    windowInnerWidthSpy.and.returnValue(screenWidth);

    await TestBed.configureTestingModule({
      imports: [FormateurLayoutComponent, RouterModule],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(FormateurLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setupTest(1024);
    expect(component).toBeTruthy();
  });

  it('should initialize isSidebarOpen to true on large screen (>= 768px)', async () => {
    await setupTest(1024);
    expect(component.isSidebarOpen).toBeTrue();
  });

  it('should initialize isSidebarOpen to false on small screen (< 768px)', async () => {
    await setupTest(500);
    expect(component.isSidebarOpen).toBeFalse();
  });

  it('should toggle sidebar when toggleSidebar is called', async () => {
    await setupTest(1024);
    const initialState = component.isSidebarOpen;
    component.toggleSidebar();
    expect(component.isSidebarOpen).toBe(!initialState);
  });
});
