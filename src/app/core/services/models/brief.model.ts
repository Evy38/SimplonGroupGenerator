// Dans src/app/core/services/models/brief.model.ts
export interface Brief {
    id: string;
    name: string;
    description: string;
    imageUrl?: string;
    sourceGroupId: string | number; // Celle-ci existe déjà et est requise
    assignedGroupId?: string | number | null; // Ajoutez celle-ci, rendez-la optionnelle si elle peut être absente au début
    // ... autres propriétés
}