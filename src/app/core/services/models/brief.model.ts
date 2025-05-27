// Dans src/app/core/services/models/brief.model.ts
export interface Brief {
    id: string;
    name: string
    title: string;
    description: string;
    promoId: string;
    creationDate: Date;
    imageUrl?: string;
    sourceGroupId: string | number;
    assignedGroupId?: string | number | null;
}