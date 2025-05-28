// src/app/core/services/models/brief.model.ts
import { Group } from './group.model'; // Assure-toi que Group est bien l'interface pour les sous-groupes de travail

export interface Brief {
  id: string;
  name: string;           // Utilisé comme titre du brief
  title: string;          // Peut être redondant ou un titre alternatif
  description: string;
  promoId: string;        // ID de la Promo principale à laquelle le brief est lié
  creationDate: Date;
  imageUrl?: string;
  sourceGroupId: string | number; // ID de la Promo d'où proviennent les membres pour former les groupes
  assignedGroupId?: string | number | null; // Si un brief entier est assigné à UN groupe spécifique (moins courant pour les sous-groupes)
  groups?: Group[];        // Tableau des sous-groupes de travail générés pour CE brief
}