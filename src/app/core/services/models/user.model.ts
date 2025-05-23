// src/app/core/models/user.model.ts (si tu crées un dossier models)
// ou src/app/core/services/user.model.ts
export type UserRole = 'apprenant' | 'formateur';

export interface User {
  id: number;
  email: string;
  name?: string; // Nom de l'utilisateur ou de l'organisation
  role: UserRole;
  // Tu pourrais ajouter d'autres propriétés ici si nécessaire
  // NE JAMAIS STOCKER LE MOT DE PASSE EN CLAIR ICI DANS UN VRAI PROJET
}