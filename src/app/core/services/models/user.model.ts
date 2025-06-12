export enum UserRole {
  FORMATEUR = 'formateur',
  APPRENANT = 'apprenant',
}

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Le mot de passe ne devrait pas toujours être exposé, mais nécessaire pour la simulation
  role: UserRole;
  promoId?: string;
  age?: number;

}
