import { UserRole } from './user.model';

export interface Person {
  id: string; 
  nom: string;
  email?: string; 
  role?: UserRole; 
  genre: 'masculin' | 'feminin' | 'nsp' | '';
  aisanceFrancais: number; // 1-4
  ancienDWWM: boolean;
  niveauTechnique: number; // 1-4
  profil: 'timide' | 'reserve' | 'alaise' | '';
  age: number | null;
}