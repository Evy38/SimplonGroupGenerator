// DANS: src/app/core/models/group.model.ts
import { Person } from './person.model';

export interface Group {
  id: string | number;
  name: string;
  members: Person[];
  imageUrl?: string;
  formateurName?: string; // Ajouté ici
  // ou formateurId?: string;
  generatedSubGroups?: Group[]; 
}