// src/app/core/models/person.model.ts
export interface Person {
  id: number | string;
  nom: string;
  genre?: 'masculin' | 'feminin' | 'nsp';         // Optionnel
  aisanceFrancais?: 1 | 2 | 3 | 4;                // Optionnel
  ancienDWWM?: boolean;                           // Optionnel
  niveauTechnique?: 1 | 2 | 3 | 4;                // Optionnel
  profil?: 'timide' | 'reserve' | 'alaise';       // Optionnel
  age?: number;                                   // Optionnel
  email?: string;                                 // Déjà optionnel, c'est bien
  role?: 'apprenant' | 'formateur';               // Optionnel si tu l'ajoutes
}