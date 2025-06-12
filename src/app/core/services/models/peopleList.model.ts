import { Person } from './person.model';

export interface PeopleList {
  id: number | string;
  name: string; // Nom de la liste (unique par utilisateur)
  ownerId: number; // ID de l'utilisateur (formateur) qui possède la liste
  people: Person[];
  numberOfDraws?: number; // Nombre de tirages réalisés avec cette liste (optionnel)
}