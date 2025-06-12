import { TestBed } from '@angular/core/testing';
import { BriefService } from './brief.service';
import { Brief } from '../../core/services/models/brief.model';
import { skip } from 'rxjs/operators';

describe('BriefService', () => {
  let service: BriefService;

  const getActualBriefs = (): Brief[] => {
    return JSON.parse(JSON.stringify(service['briefsData']));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BriefService);
  });

  it('devrait être créé', () => {
    expect(service).toBeTruthy();
  });

  it('getAllBriefs() devrait retourner tous les briefs initiaux', (done) => {
    const expected = getActualBriefs();
    service.getAllBriefs().subscribe((briefs) => {
      expect(briefs.length).toBe(expected.length);
      done();
    });
  });

  describe('getBriefById()', () => {
    it('devrait retourner le brief correspondant si ID existe', (done) => {
      const brief = getActualBriefs()[0];
      service.getBriefById(brief.id).subscribe((found) => {
        expect(found?.id).toBe(brief.id);
        done();
      });
    });

    it('devrait retourner undefined si ID inexistant', (done) => {
      service.getBriefById('id-invalide').subscribe((found) => {
        expect(found).toBeUndefined();
        done();
      });
    });
  });

  describe('getBriefsByPromoId()', () => {
    it('devrait retourner les briefs de la promo spécifiée', (done) => {
      const promoId = getActualBriefs()[0].promoId;
      service.getBriefsByPromoId(promoId).subscribe((briefs) => {
        briefs.forEach(b => expect(b.promoId).toBe(promoId));
        done();
      });
    });

    it('devrait retourner un tableau vide si promoId inexistant', (done) => {
      service.getBriefsByPromoId('promo-invalide').subscribe((briefs) => {
        expect(briefs.length).toBe(0);
        done();
      });
    });
  });

  describe('addBrief()', () => {
    it('devrait ajouter un nouveau brief et l’émettre', (done) => {
      const initialLength = getActualBriefs().length;
      const data = {
        name: 'Nouveau Brief Test',
        title: 'Test Title',
        description: 'Description test',
        imageUrl: 'image-test.png',
      };

      service.briefs$.pipe(skip(1)).subscribe((briefs) => {
        expect(briefs.length).toBe(initialLength + 1);
        expect(briefs.some(b => b.name === data.name)).toBeTrue();
        done();
      });

      service.addBrief(data, 'promoTest', 'sourceTest');
    });
  });

  describe('updateBrief()', () => {
    it('devrait mettre à jour un brief existant', (done) => {
      const briefToUpdate = getActualBriefs()[0];
      const updated = { ...briefToUpdate, title: 'Titre modifié' };

      service.updateBrief(updated).subscribe((result) => {
        expect(result?.title).toBe('Titre modifié');
        done();
      });
    });

    it('ne devrait rien faire si brief non trouvé', (done) => {
      const spy = spyOn(console, 'warn');
      const result$ = service.updateBrief({
        ...getActualBriefs()[0],
        id: 'id-inexistant',
      });

      result$.subscribe((result) => {
        expect(result).toBeUndefined();
        expect(spy).toHaveBeenCalledWith(
          jasmine.stringMatching(/BriefService: Tentative de MAJ d'un brief non trouvé/)
        );
        done();
      });
    });
  });

  describe('deleteBrief()', () => {
    it('devrait supprimer un brief existant', (done) => {
      const idToDelete = getActualBriefs()[0].id;
      const initialLength = getActualBriefs().length;

      service.briefs$.pipe(skip(1)).subscribe((briefs) => {
        expect(briefs.length).toBe(initialLength - 1);
        expect(briefs.some(b => b.id === idToDelete)).toBeFalse();
        done();
      });

      service.deleteBrief(idToDelete).subscribe((success) => {
        expect(success).toBeTrue();
      });
    });

    it('ne devrait rien supprimer si ID inexistant', (done) => {
      const spy = spyOn(console, 'warn');

      service.deleteBrief('id-invalide').subscribe((success) => {
        expect(success).toBeFalse();
        expect(spy).toHaveBeenCalledWith(
          jasmine.stringMatching(/BriefService: Tentative de suppression d'un brief non trouvé/)
        );
        done();
      });
    });
  });
});
