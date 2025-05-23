// src/app/core/models/brief.model.ts
export interface Brief {
  id: string | number;
  name: string;
  description: string;
  imageUrl?: string;
  peopleListId?: string | number; // ID de la "promo" ou liste de personnes source
  assignedGroupId?: string | number | null; // Si un seul groupe peut être assigné
  assignedGroupIds?: (string | number)[]; // Si plusieurs groupes peuvent être assignés (préférable)
}