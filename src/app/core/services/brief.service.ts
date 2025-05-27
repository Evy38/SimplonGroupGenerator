// src/app/core/services/brief.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; // BehaviorSubject est comme une "boîte" qui garde la valeur actuelle et prévient quand elle change.
import { map } from 'rxjs/operators';
import { Brief } from '../../core/services/models/brief.model';     // Ton modèle de brief

// Liste de départ de tes briefs.
// IMPORTANT : Les 'sourceGroupId' ici doivent correspondre à des 'id'
// de promos qui existent dans tes INITIAL_PROMOS_DATA de PromoService.
const INITIAL_BRIEFS_DATA: Brief[] = [
  {
    id: 'grpPoneys',
    name: 'Projet Portfolio',
    title: 'Projet Portfolio', // Ajout de la propriété manquante
    description: 'Création d\'un site portfolio personnel.',
    imageUrl: 'assets/portfolio.png', // Vérifie que ce chemin est correct
    sourceGroupId: 'grpPoneys',
    promoId: 'grpPoneys', // Ajout de la propriété manquante (à adapter si besoin)
    creationDate: new Date() // Ajout de la propriété manquante
  },
  {
    id: 'grpMarmottes',
    name: 'API E-commerce',
    title: 'API E-commerce', // Ajout de la propriété manquante
    description: 'Développement d\'une API pour un site marchand.',
    imageUrl: 'assets/taches.png', // Vérifie que ce chemin est correct
    sourceGroupId: 'grpMarmottes',
    promoId: 'grpMarmottes', // Ajout de la propriété manquante (à adapter si besoin)
    creationDate: new Date() // Ajout de la propriété manquante
  },
   {
    id: 'brief-api-blog-poneys', // ID unique
    name: 'API Blog ',
    title: 'Développement API pour un Blog',
    description: 'Les apprenants de la promo Poneys travailleront sur la création d\'une API RESTful pour une application de blog simple (articles, commentaires, utilisateurs).',
    imageUrl: 'assets/blog.png', // Crée ou utilise une image appropriée
    sourceGroupId: 'grpPoneys', // Lié à la promo "Poneys"
    promoId: 'grpPoneys',       // Lié à la promo "Poneys"
    creationDate: new Date(2024, 1, 1) // Exemple de date (1 Février 2024)
    // assignedGroupId: null,
  },
];

@Injectable({
  providedIn: 'root' // Cela rend le service disponible dans toute ton application
})
export class BriefService {
  // Le BehaviorSubject qui va contenir notre liste de briefs.
  // Il est privé car seul le service doit pouvoir le modifier directement.
  private briefsSubject = new BehaviorSubject<Brief[]>(INITIAL_BRIEFS_DATA);

  // L'Observable que les composants vont utiliser pour "écouter" les changements de la liste des briefs.
  // C'est la version "publique" et "lecture seule" de briefsSubject.
  public briefs$: Observable<Brief[]> = this.briefsSubject.asObservable();

  constructor() {
    // Juste pour voir dans la console que le service est bien créé et avec quelles données.
    console.log('BriefService initialisé avec:', this.briefsSubject.getValue());
     console.log('BriefService initialisé avec IDs:', INITIAL_BRIEFS_DATA.map(b => b.id));
  }

 getBriefById(id: string): Observable<Brief | undefined> {
    return this.briefs$.pipe(
      map((briefs: Brief[]) => {
        const foundBrief = briefs.find(brief => brief.id === id);
        // Ajout d'un log pour déboguer la recherche
        console.log(`Recherche du brief avec ID '${id}'. Trouvé:`, foundBrief ? { ...foundBrief } : 'Non');
        return foundBrief;
      })
    );
  }

  addBrief(briefData: Omit<Brief, 'id'>): Brief { // Omit<Brief, 'id'> signifie "toutes les propriétés de Brief SAUF id"
  const currentBriefs = this.briefsSubject.getValue(); // Récupère la liste actuelle

  // Création du nouveau brief avec un ID unique (similaire à ce que tu fais pour les promos)
  const newBrief: Brief = {
    id: `brief-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Génère un ID
    ...briefData // Ajoute les autres propriétés (name, description, sourceGroupId, etc.)
  };

  const updatedBriefs = [...currentBriefs, newBrief]; // Ajoute le nouveau brief à la liste
  this.briefsSubject.next(updatedBriefs); // Émet la nouvelle liste

  console.log('BriefService: Nouveau brief ajouté:', newBrief);
  return newBrief; // Optionnel: retourner le brief créé peut être utile
}

deleteBrief(briefId: string): void {
  const currentBriefs = this.briefsSubject.getValue();
  const updatedBriefs = currentBriefs.filter(brief => brief.id !== briefId);

  // On vérifie si un brief a réellement été supprimé pour éviter d'émettre inutilement
  // et pour avoir un log plus précis.
  if (updatedBriefs.length < currentBriefs.length) {
    this.briefsSubject.next(updatedBriefs);
    console.log(`BriefService: Brief avec ID '${briefId}' supprimé.`);
  } else {
    console.warn(`BriefService: Tentative de suppression d'un brief non trouvé (ID: ${briefId})`);
  }
}

}