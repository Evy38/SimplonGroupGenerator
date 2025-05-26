export type UserRole = 'apprenant' | 'formateur' | 'admin'; // Ajout d'admin au cas où, sinon retire-le

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // Le mot de passe ne devrait pas toujours être exposé, mais nécessaire pour la simulation
  role: UserRole;
  // genre?: string;
  // age?: number;
  // etc.
}