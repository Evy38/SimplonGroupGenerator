// src/app/core/services/promo.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importe map
import { Group } from '../../core/services/models/group.model';   // Représente tes "Promos"
import { Person } from '../../core/services/models/person.model';

// --- DÉFINITION DES DONNÉES DE BASE (PRIVÉES AU SERVICE) ---
const MOCK_PEOPLE_DATA: Person[] = [
  { id: 'p1', nom: 'Alice Lemaire (Poney/Chaton)', email: 'alice@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 3, profil: 'alaise', age: 28 },
  { id: 'p2', nom: 'Bob Martin (Poney)', email: 'bob@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 2, profil: 'reserve', age: 22 },
  { id: 'p3', nom: 'Charlie Durand (Marmotte)', email: 'charlie@mail.com', genre: 'nsp', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 4, profil: 'timide', age: 30 },
  { id: 'p4', nom: 'Diana Pires (Marmotte/Chaton)', email: 'diana@mail.com', genre: 'feminin', aisanceFrancais: 2, ancienDWWM: false, niveauTechnique: 1, profil: 'alaise', age: 25 },
  { id: 'p5', nom: 'Émile Petit (Marmotte)', email: 'emile@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: true, niveauTechnique: 2, profil: 'reserve', age: 27 },
  { id: 'p6', nom: 'Fiona Guyot (Poney/Chaton)', email: 'fiona@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: false, niveauTechnique: 3, profil: 'alaise', age: 24 },
  { id: 'p7', nom: 'Gaspard Roux', email: 'gaspard@mail.com', genre: 'masculin', aisanceFrancais: 2, ancienDWWM: false, niveauTechnique: 1, profil: 'timide', age: 29 },
  { id: 'p8', nom: 'Hélène Claire', email: 'helene@mail.com', genre: 'feminin', aisanceFrancais: 3, ancienDWWM: true, niveauTechnique: 3, profil: 'reserve', age: 26 },
  {
    id: 'p-apprenant-test', // ID unique
    nom: 'Apprenant Test User',
    email: 'apprenant@test.com', // Email correspondant à votre mockUser
    genre: 'nsp', // Ou ce que vous voulez
    aisanceFrancais: 3,
    ancienDWWM: false,
    niveauTechnique: 2,
    profil: 'reserve',
    age: 25
  }
];


const INITIAL_PROMOS_DATA: Group[] = [
  {
    id: 'grpPoneys',
    name: 'Les Poneys',
    members: [MOCK_PEOPLE_DATA[7], MOCK_PEOPLE_DATA[2], MOCK_PEOPLE_DATA[8], MOCK_PEOPLE_DATA[1], MOCK_PEOPLE_DATA[8]],
    imageUrl: 'assets/poneys.png',
    formateurName: 'Formateur Test' // Ou l'ID: 'user-formateur-id'
  },
  {
    id: 'grpMarmottes',
    name: 'Les Marmottes',
    members: [MOCK_PEOPLE_DATA[7], MOCK_PEOPLE_DATA[1], MOCK_PEOPLE_DATA[8], MOCK_PEOPLE_DATA[5], MOCK_PEOPLE_DATA[8]],
    imageUrl: 'assets/marmottes.png',
    formateurName: 'Dr. Merlin Enchanteur' // Autre exemple de nom
  },
  {
    id: 'grpChatons',
    name: 'Les Chatons',
    members: [MOCK_PEOPLE_DATA[0], MOCK_PEOPLE_DATA[3], MOCK_PEOPLE_DATA[8]],
    imageUrl: 'assets/chatons.png',
    formateurName: 'Professeur Minerva McGonagall'
  },
];
// --- FIN DES DONNÉES DE BASE ---

@Injectable({
  providedIn: 'root'
})
export class PromoService {
  private promosSubject = new BehaviorSubject<Group[]>(
    JSON.parse(JSON.stringify(INITIAL_PROMOS_DATA))
  );
  // Observable public auquel les composants peuvent s'abonner pour obtenir la liste des promos.
   public promos$: Observable<Group[]> = this.promosSubject.asObservable();

  constructor() {
    console.log("PromoService initialisé. Promos actuelles:", this.promosSubject.value);
  }

   private saveDataToLocalStorage(promos: Group[]): void { // Optionnel, pour persistance locale
    localStorage.setItem('simplonAppPromos', JSON.stringify(promos));
    // Pour l'instant, on ne l'active pas pour simplifier
  }

  /** Retourne un observable de toutes les promos. */
  getAllPromos(): Observable<Group[]> {
    return this.promos$;
  }

  /** Retourne un observable d'une promo spécifique par son ID. */
  getPromoById(id: string | number): Observable<Group | undefined> {
    return this.promos$.pipe(
      map(promos => {
        const foundPromo = promos.find(p => p.id === id);
        // Retourner une copie profonde pour éviter les modifications directes de l'état du service par les composants
        return foundPromo ? JSON.parse(JSON.stringify(foundPromo)) : undefined;
      })
    );
  }

  /** Retourne une copie des membres d'une promo spécifique. */
  getPromoMembersCopy(promoId: string | number): Person[] {
    const promos = this.promosSubject.getValue();
    const promo = promos.find(p => p.id === promoId);
    return promo ? JSON.parse(JSON.stringify(promo.members)) : [];
  }


   // --- NOUVELLES MÉTHODES CRUD POUR LES PROMOS ---

  /** Crée une nouvelle promo et la retourne. */
  addPromo(newPromoData: Omit<Group, 'id'>): Group {
    const currentPromos = this.promosSubject.getValue();
    const promoToAdd: Group = {
      id: `promo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // ID plus unique
      name: newPromoData.name,
      members: newPromoData.members ? newPromoData.members.map(m => ({...m})) : [], // Copie des membres
      imageUrl: newPromoData.imageUrl
    };
    const updatedPromos = [...currentPromos, promoToAdd];
    this.promosSubject.next(updatedPromos);
    this.saveDataToLocalStorage(updatedPromos); // Si localStorage activé
    console.log('PromoService: Nouvelle promo ajoutée:', promoToAdd);
    return promoToAdd; // Retourne la promo créée
  }

  /** Met à jour une promo existante. */
  updatePromo(updatedPromoData: Group): void {
    const currentPromos = this.promosSubject.getValue();
    const index = currentPromos.findIndex(p => p.id === updatedPromoData.id);
    if (index > -1) {
      const newPromosList = [...currentPromos]; // Copier le tableau
      // Assurer une copie profonde de l'objet promo mis à jour
      newPromosList[index] = JSON.parse(JSON.stringify(updatedPromoData));
      this.promosSubject.next(newPromosList);
      this.saveDataToLocalStorage(newPromosList); // Si localStorage activé
      console.log('PromoService: Promo mise à jour:', newPromosList[index]);
    } else {
      console.warn(`PromoService: Tentative de mise à jour d'une promo non trouvée (ID: ${updatedPromoData.id})`);
    }
  }
 /** Supprime une promo par son ID. */
  deletePromo(promoId: string | number): void {
    const currentPromos = this.promosSubject.getValue();
    const updatedPromos = currentPromos.filter(p => p.id !== promoId);
    // Vérifier si quelque chose a été réellement supprimé
    if (updatedPromos.length < currentPromos.length) {
      this.promosSubject.next(updatedPromos);
      this.saveDataToLocalStorage(updatedPromos); // Si localStorage activé
      console.log(`PromoService: Promo avec ID ${promoId} supprimée.`);
    } else {
      console.warn(`PromoService: Tentative de suppression d'une promo non trouvée (ID: ${promoId})`);
    }
  }


  /**
   * Ajoute un membre à une promo spécifique.
   * S'assure de l'immutabilité pour une bonne détection de changement par Angular.
   */
  // --- MÉTHODES POUR GÉRER LES MEMBRES D'UNE PROMO SPÉCIFIQUE ---
  addMemberToPromo(promoId: string | number, memberToAdd: Person): void {
    const currentPromos = this.promosSubject.getValue();
    const updatedPromos = currentPromos.map(promo => {
      if (promo.id === promoId) {
        if (!promo.members.find(m => m.id === memberToAdd.id)) {
          return { ...promo, members: [...promo.members, { ...memberToAdd }] };
        }
      }
      return promo;
    });
    if (JSON.stringify(updatedPromos) !== JSON.stringify(currentPromos)) {
      this.promosSubject.next(updatedPromos);
      this.saveDataToLocalStorage(updatedPromos);
    }
  }

  /**
   * Retire un membre d'une promo spécifique.
   * S'assure de l'immutabilité.
   */
   removeMemberFromPromo(promoId: string | number, memberIdToRemove: string | number): void {
    const currentPromos = this.promosSubject.getValue();
    const updatedPromos = currentPromos.map(promo => {
      if (promo.id === promoId) {
        return { ...promo, members: promo.members.filter(m => m.id !== memberIdToRemove) };
      }
      return promo;
    });
    this.promosSubject.next(updatedPromos);
    this.saveDataToLocalStorage(updatedPromos);
  }
}
  // TODO: Ajouter des méthodes pour créer une nouvelle promo, supprimer une promo, modifier le nom/image d'une promo.
  // Ces méthodes suivront le même principe : obtenir la valeur actuelle, créer une nouvelle liste/objet avec
  // les modifications, puis appeler this.promosSubject.next(nouvelleListe).
