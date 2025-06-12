// src/app/core/services/brief.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Brief } from '../../core/services/models/brief.model'; // Changement de chemin pour correspondre à ton arborescence probable
import { Group } from '../../core/services/models/group.model'; // Importer Group
import { Person } from '../../core/services/models/person.model'; // Importer Person
import { UserRole } from '../../core/services/models/user.model'; // Importer UserRole si tu l'utilises dans Person

// --- DÉFINITION DES PERSONNES DE TEST (POUR FACILITER LA LECTURE) ---
// Tu devrais avoir un seul endroit pour définir tes Personnes mockées
// Idéalement dans un fichier séparé ou au moins une seule constante partagée.
// Pour cet exemple, je les définis ici. Adapte avec tes propres objets Person.
const apprenantTestUser: Person = {
  id: 'user-apprenant-id', // ID de ton apprenant test (utilisé dans AuthService)
  nom: 'Apprenant Test User',
  email: 'apprenant@test.com',
  role: UserRole.APPRENANT, // Assure-toi que UserRole est bien défini et importé
  genre: 'nsp',
  aisanceFrancais: 3,
  ancienDWWM: false,
  niveauTechnique: 2,
  profil: 'reserve',
  age: 25
};

const autreApprenant1: Person = {
  id: 'p1', nom: 'Alice Lemaire', email: 'alice@mail.com', genre: 'feminin',
  aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 3, profil: 'alaise', age: 28
};

const autreApprenant2: Person = {
  id: 'p2', nom: 'Bob Martin', email: 'bob@mail.com', genre: 'masculin',
  aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 2, profil: 'reserve', age: 22
};
// --- FIN DES PERSONNES DE TEST ---


// Liste de départ de tes briefs.
const INITIAL_BRIEFS_DATA: Brief[] = [
  {
    id: 'brief-portfolio-poneys',
    name: 'Projet Portfolio',    // Utilisé pour le titre affiché dans la carte du formateur
    title: 'Projet Portfolio',   // Utilisé pour le titre dans le détail et la carte apprenant
    description: 'Création d\'un site portfolio personnel.',
    imageUrl: 'assets/portfolio.png',
    sourceGroupId: 'grpPoneys', // Promo d'où viennent les élèves pour la génération des groupes
    promoId: 'grpPoneys',       // Promo à laquelle ce brief est destiné (pour l'apprenant)
    creationDate: new Date('2024-01-15'),
    groups: [ // <--- MODIFICATION ICI : Groupes pré-remplis
      {
        id: 'wg-portfolio-alpha-123', // ID unique pour ce sous-groupe
        name: 'Équipe Alpha (Portfolio)',
        members: [apprenantTestUser, autreApprenant1] // apprenantTestUser est ici
      }
    ]
  },
  {
    id: 'brief-ecommerce-marmottes', // L'ID du brief
    name: 'API E-commerce',
    title: 'API E-commerce',
    description: 'Développement d\'une API pour un site marchand.',
    imageUrl: 'assets/taches.png',
    sourceGroupId: 'grpPoneys', // Les membres viennent des Poneys
    promoId: 'grpPoneys',       // Mais le brief est pour la promo Poneys (donc apprenantTestUser devrait le voir)
    creationDate: new Date('2024-02-20'),
    groups: [ // <--- MODIFICATION ICI : Groupes pré-remplis
      {
        id: 'wg-ecommerce-frontend-456',
        name: 'Frontend Masters (E-commerce)',
        members: [apprenantTestUser, autreApprenant2] // apprenantTestUser est aussi ici
      },
      {
        id: 'wg-ecommerce-backend-789',
        name: 'Backend Ninjas (E-commerce)',
        members: [autreApprenant1] // apprenantTestUser n'est PAS dans ce sous-groupe particulier
      }
    ]
  },
  {
    id: 'brief-jeu-chatons',
    name: 'Jeu 2D',
    title: 'Création Jeu 2D',
    description: 'Développement d\'un petit jeu en JavaScript.',
    imageUrl: 'assets/jeu.png',
    sourceGroupId: 'grpChatons', // Supposons une promo Chatons
    promoId: 'grpChatons',       // Si apprenantTestUser est dans 'grpPoneys', il ne verra pas ce brief
    creationDate: new Date('2024-03-10'),
    groups: [ // Exemple de groupe, mais l'apprenant ne le verra que si promoId correspond
        { id: 'wg-jeu-designers-abc', name: 'Game Designers', members: [autreApprenant1, autreApprenant2] }
    ]
  },
  {
    id: 'brief-sans-groupes',
    name: 'Brief sans groupes initiaux',
    title: 'Brief sans groupes initiaux',
    description: 'Ce brief n\'a pas de groupes définis au départ.',
    imageUrl: 'assets/placeholder-brief.png',
    sourceGroupId: 'grpPoneys',
    promoId: 'grpPoneys',
    creationDate: new Date('2024-04-01'),
    groups: [] // Vide, comme avant, pour tester le cas "aucun groupe" pour ce brief
  }
];

@Injectable({
  providedIn: 'root'
})
export class BriefService {
  private briefsData: Brief[] = JSON.parse(JSON.stringify(INITIAL_BRIEFS_DATA));
  private briefsSubject = new BehaviorSubject<Brief[]>(this.copyBriefsData());
  public briefs$: Observable<Brief[]> = this.briefsSubject.asObservable();

  constructor() {
    console.log('BriefService initialisé avec:', JSON.parse(JSON.stringify(this.briefsSubject.getValue())));
  }

  private copyBriefsData(): Brief[] {
    return JSON.parse(JSON.stringify(this.briefsData));
  }

  getBriefById(id: string): Observable<Brief | undefined> {
    return this.briefs$.pipe(
      map(allBriefs => {
        const foundBrief = allBriefs.find(brief => brief.id === id);
        // console.log(`BriefService (getBriefById): Recherche ID '${id}'. Trouvé:`, foundBrief ? JSON.parse(JSON.stringify(foundBrief)) : 'Non');
        return foundBrief; // La copie est déjà faite par briefs$ qui émet des copies
      })
    );
  }

  getBriefsByPromoId(promoId: string): Observable<Brief[]> {
    return this.briefs$.pipe(
      map(allBriefs => {
        // console.log(`BriefService (getBriefsByPromoId): Tous les briefs de briefs$ pour filtrage promoId '${promoId}':`, JSON.parse(JSON.stringify(allBriefs)));
        const filteredBriefs = allBriefs.filter(brief => brief.promoId === promoId);
        // console.log(`BriefService: Filtrage pour promoId '${promoId}', briefs trouvés:`, JSON.parse(JSON.stringify(filteredBriefs)));
        return filteredBriefs; // map sur un observable qui émet des copies renverra un tableau de ces copies
      })
    );
  }

  getAllBriefs(): Observable<Brief[]> {
    return this.briefs$; // briefs$ émet déjà des copies grâce à copyBriefsData()
  }

  addBrief(
    briefData: Omit<Brief, 'id' | 'creationDate' | 'groups' | 'promoId' | 'sourceGroupId'>,
    targetPromoId: string,
    sourcePromoId: string | number
  ): Observable<Brief> {
    const newBrief: Brief = {
      id: `brief-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: briefData.title, // S'assurer que briefData a bien title et name
      name: briefData.name,
      description: briefData.description,
      imageUrl: briefData.imageUrl,
      promoId: targetPromoId,
      sourceGroupId: sourcePromoId,
      creationDate: new Date(),
      groups: [] // Les nouveaux briefs sont initialisés avec un tableau de groupes vide
    };
    this.briefsData.push(newBrief);
    this.briefsSubject.next(this.copyBriefsData());
    console.log('BriefService: Nouveau brief ajouté:', newBrief);
    return of(JSON.parse(JSON.stringify(newBrief))); // Retourner une copie
  }

  updateBrief(updatedBrief: Brief): Observable<Brief | undefined> {
    const index = this.briefsData.findIndex(b => b.id === updatedBrief.id);
    if (index > -1) {
      this.briefsData[index] = JSON.parse(JSON.stringify(updatedBrief)); // Remplacer par une copie profonde
      console.log('BriefService: Brief dans briefsData APRÈS MAJ:', JSON.parse(JSON.stringify(this.briefsData[index])));
      this.briefsSubject.next(this.copyBriefsData());
      return of(JSON.parse(JSON.stringify(this.briefsData[index])));
    }
    console.warn(`BriefService: Tentative de MAJ d'un brief non trouvé (ID: ${updatedBrief.id})`);
    return of(undefined);
  }

  deleteBrief(briefId: string): Observable<boolean> {
    const initialLength = this.briefsData.length;
    this.briefsData = this.briefsData.filter(brief => brief.id !== briefId);
    if (this.briefsData.length < initialLength) {
      this.briefsSubject.next(this.copyBriefsData());
      console.log(`BriefService: Brief avec ID '${briefId}' supprimé.`);
      return of(true);
    }
    console.warn(`BriefService: Tentative de suppression d'un brief non trouvé (ID: ${briefId})`);
    return of(false);
  }
}