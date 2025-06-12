import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { ApprenantLayoutComponent } from './apprenant-layout.component';

describe('ApprenantLayoutComponent', () => {
  let component: ApprenantLayoutComponent;
  let fixture: ComponentFixture<ApprenantLayoutComponent>;
  let windowInnerWidthSpy: jasmine.Spy;

  beforeAll(() => {
    // On espionne window.innerWidth une seule fois
    windowInnerWidthSpy = spyOnProperty(window, 'innerWidth', 'get');
  });

  async function setupWithWidth(width: number) {
    windowInnerWidthSpy.and.returnValue(width);

    await TestBed.configureTestingModule({
      imports: [ApprenantLayoutComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();

    fixture = TestBed.createComponent(ApprenantLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setupWithWidth(1024);
    expect(component).toBeTruthy();
  });

  it('should initialize sidebar as open in desktop view', async () => {
    await setupWithWidth(1024);
    expect(component.isMobileView).toBeFalse();
    expect(component.isLayoutSidebarOpen).toBeTrue();
  });

  it('should initialize sidebar as closed in mobile view', async () => {
    await setupWithWidth(400);
    expect(component.isMobileView).toBeTrue();
    expect(component.isLayoutSidebarOpen).toBeFalse();
  });

  it('should toggle sidebar and update scroll class', async () => {
    await setupWithWidth(500); // mobile mode pour permettre le toggle

    const addClassSpy = spyOn(component['renderer'], 'addClass');
    const removeClassSpy = spyOn(component['renderer'], 'removeClass');

    component.isLayoutSidebarOpen = false;
    component.toggleApprenantSidebar();
    expect(component.isLayoutSidebarOpen).toBeTrue();
    expect(addClassSpy).toHaveBeenCalled();

    component.toggleApprenantSidebar();
    expect(component.isLayoutSidebarOpen).toBeFalse();
    expect(removeClassSpy).toHaveBeenCalled();
  });

  it('should remove scroll lock class on destroy', async () => {
    await setupWithWidth(500);
    const removeClassSpy = spyOn(component['renderer'], 'removeClass');
    component.ngOnDestroy();
    expect(removeClassSpy).toHaveBeenCalledWith(document.body, 'body-no-scroll');
  });
});
