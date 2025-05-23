import { Person } from './person.model';

export interface Group {
  id: number | string;
  name: string; // Nom donné au groupe lors de la création
  members: Person[];
  imageUrl?: string;
}