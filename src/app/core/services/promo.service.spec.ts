// src/app/core/services/promo.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { PromoService } from './promo.service';
import { Group } from '../../core/services/models/group.model'; // Ajuste le chemin vers tes modèles
import { Person } from '../../core/services/models/person.model'; // Ajuste le chemin vers tes modèles
import { skip } from 'rxjs/operators'; // Utile pour ignorer la première émission du BehaviorSubject si besoin

describe('PromoService', () => {
  let service: PromoService;

  // Helper pour obtenir une copie des données initiales réelles du service
  // C'est un peu un "cheat" pour les tests, mais utile pour comparer.
  const getActualInitialPromosFromService = (
    testService: PromoService
  ): Group[] => {
    return JSON.parse(JSON.stringify(testService['promosSubject'].getValue()));
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('promos$ should initially emit the list of promos the service was initialized with', (done) => {
    const actualInitialPromos = getActualInitialPromosFromService(service);

    service.promos$.subscribe((promos) => {
      expect(promos.length).toBe(actualInitialPromos.length);
      if (actualInitialPromos.length > 0) {
        // Vérifie si la structure du premier élément correspond (par exemple, l'ID)
        expect(promos[0].id).toEqual(actualInitialPromos[0].id);
      }
      done(); // Important pour les observables
    });
  });

  describe('getPromoById', () => {
    it('should return an Observable with the correct promo if ID exists', (done) => {
      const actualInitialPromos = getActualInitialPromosFromService(service);
      if (actualInitialPromos.length === 0) {
        // Si pas de données initiales, ce test n'a pas de sens, on le passe
        pending('No initial promos to test getPromoById with.');
        done();
        return;
      }
      const existingPromo = actualInitialPromos[0];

      service.getPromoById(existingPromo.id).subscribe((promo) => {
        expect(promo).toBeDefined();
        expect(promo?.id).toBe(existingPromo.id);
        expect(promo?.name).toBe(existingPromo.name);
        done();
      });
    });

    it('should return an Observable with undefined if ID does not exist', (done) => {
      service.getPromoById('non-existent-id-123').subscribe((promo) => {
        expect(promo).toBeUndefined();
        done();
      });
    });
  });

  describe('addPromo', () => {
    it('should add a new promo and emit the updated list via promos$', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      const initialCount = initialPromos.length;

      const newPromoData: Omit<Group, 'id'> = {
        name: 'Nouvelle Promo Test',
        members: [],
        imageUrl: 'new_promo.png',
      };

      // On s'abonne APRES la première émission pour ne pas attraper l'état initial ici,
      // mais l'état APRES l'action. 'skip(1)' ignore la valeur actuelle du BehaviorSubject.
      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        expect(updatedPromos.length).toBe(initialCount + 1);
        const addedPromo = updatedPromos.find(
          (p) => p.name === 'Nouvelle Promo Test'
        );
        expect(addedPromo).toBeDefined();
        expect(addedPromo?.id).toBeDefined(); // L'ID doit avoir été généré
        expect(addedPromo?.imageUrl).toBe('new_promo.png');
        done();
      });

      service.addPromo(newPromoData); // Déclenche l'action
    });
  });

  describe('updatePromo', () => {
    it('should update an existing promo and emit the updated list', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      if (initialPromos.length === 0) {
        pending('No initial promos to test updatePromo with.');
        done();
        return;
      }
      const promoToUpdateOriginal = initialPromos[0];
      const updatedName = 'Nom Mis à Jour de la Promo';
      const promoWithUpdates: Group = {
        ...promoToUpdateOriginal, // Garde l'ID et les autres propriétés
        name: updatedName,
        members: [
          ...promoToUpdateOriginal.members,
          { id: 'tempMember', nom: 'Membre Temporaire' } as Person,
        ], // Exemple de modif membres
      };

      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        const updatedPromoInList = updatedPromos.find(
          (p) => p.id === promoToUpdateOriginal.id
        );
        expect(updatedPromoInList).toBeDefined();
        expect(updatedPromoInList?.name).toBe(updatedName);
        expect(updatedPromoInList?.members.length).toBe(
          promoToUpdateOriginal.members.length + 1
        );
        done();
      });

      service.updatePromo(promoWithUpdates);
    });

    it('should not change the list if trying to update a non-existent promo', (done) => {
      const nonExistentPromo: Group = {
        id: 'id-qui-nexiste-pas',
        name: 'Promo Fantôme',
        members: [],
      };
      const initialPromos = getActualInitialPromosFromService(service);

      // Pour ce test, on veut s'assurer qu'aucune nouvelle valeur n'est émise
      // ou que la valeur émise est la même que l'initiale.
      // C'est un peu plus délicat à tester proprement sans timeout.
      // Une approche simple : on vérifie la liste après un court délai.
      // Ou on vérifie qu'après l'appel, la liste n'a pas changé.

      service.updatePromo(nonExistentPromo);

      // Vérification immédiate (peut ne pas suffire si updatePromo était asynchrone, mais ici il est synchrone pour la logique principale)
      const promosAfterAttemptedUpdate =
        getActualInitialPromosFromService(service); // Récupère l'état actuel
      expect(promosAfterAttemptedUpdate.length).toBe(initialPromos.length);
      // On peut aussi s'abonner et vérifier qu'il n'y a pas d'émission "inattendue" pendant un certain temps, mais c'est plus complexe.
      // Pour l'instant, on se fie au fait que le BehaviorSubject n'est pas "nexté" si l'index n'est pas trouvé.
      const consoleWarnSpy = spyOn(console, 'warn'); // Espionne console.warn
      service.updatePromo(nonExistentPromo);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /Tentative de mise à jour d'une promo non trouvée/
        )
      );

      done();
    });
  });

  describe('deletePromo', () => {
    it('should delete an existing promo and emit the updated list', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      if (initialPromos.length === 0) {
        pending('No initial promos to test deletePromo with.');
        done();
        return;
      }
      const promoToDelete = initialPromos[0];
      const initialCount = initialPromos.length;

      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        expect(updatedPromos.length).toBe(initialCount - 1);
        const deletedPromoInList = updatedPromos.find(
          (p) => p.id === promoToDelete.id
        );
        expect(deletedPromoInList).toBeUndefined();
        done();
      });

      service.deletePromo(promoToDelete.id);
    });

    it('should not change the list if trying to delete a non-existent promo', (done) => {
      const initialPromosCount =
        getActualInitialPromosFromService(service).length;
      const consoleWarnSpy = spyOn(console, 'warn');

      service.deletePromo('id-inexistant-pour-delete');

      const promosAfterAttempt = getActualInitialPromosFromService(service);
      expect(promosAfterAttempt.length).toBe(initialPromosCount); // La taille ne doit pas avoir changé
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        jasmine.stringMatching(
          /Tentative de suppression d'une promo non trouvée/
        )
      );
      done();
    });
  });

  describe('addMemberToPromo', () => {
    it('should add a member to the specified promo if not already present', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      const promo = initialPromos[0];
      const memberToAdd: Person = {
        id: 'new-member-id',
        nom: 'Nouveau Membre',
        email: 'new@mail.com',
        genre: 'nsp',
        aisanceFrancais: 3,
        ancienDWWM: false,
        niveauTechnique: 2,
        profil: 'timide',
        age: 30,
      };

      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        const updatedPromo = updatedPromos.find((p) => p.id === promo.id);
        expect(updatedPromo).toBeDefined();
        expect(
          updatedPromo!.members.find((m) => m.id === memberToAdd.id)
        ).toBeDefined();
        done();
      });

      service.addMemberToPromo(promo.id, memberToAdd);
    });

    it('should not add a duplicate member to the promo', () => {
      const initialPromos = getActualInitialPromosFromService(service);
      const promo = initialPromos[0];
      const existingMember = promo.members[0];

      const beforeCount = promo.members.filter(
        (m) => m.id === existingMember.id
      ).length;

      service.addMemberToPromo(promo.id, existingMember);

      const updatedPromos = getActualInitialPromosFromService(service);
      const updatedPromo = updatedPromos.find((p) => p.id === promo.id)!;
      const afterCount = updatedPromo.members.filter(
        (m) => m.id === existingMember.id
      ).length;

      expect(afterCount).toBe(beforeCount); // Toujours 1
    });
  });

  describe('removeMemberFromPromo', () => {
    it('should remove a member from the specified promo', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      const promo = initialPromos[0];
      const memberToRemove = promo.members[0];

      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        const updatedPromo = updatedPromos.find((p) => p.id === promo.id);
        expect(
          updatedPromo!.members.find((m) => m.id === memberToRemove.id)
        ).toBeUndefined();
        done();
      });

      service.removeMemberFromPromo(promo.id, memberToRemove.id);
    });

    it('should not throw or fail if member to remove does not exist', (done) => {
      const initialPromos = getActualInitialPromosFromService(service);
      const promo = initialPromos[0];

      service.promos$.pipe(skip(1)).subscribe((updatedPromos) => {
        const updatedPromo = updatedPromos.find((p) => p.id === promo.id);
        expect(updatedPromo!.members.length).toBe(promo.members.length); // rien supprimé
        done();
      });

      service.removeMemberFromPromo(promo.id, 'id-inexistant-membre');
    });
  });
});
