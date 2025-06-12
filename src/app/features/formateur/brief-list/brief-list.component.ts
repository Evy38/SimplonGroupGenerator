// src/app/features/formateur/brief-list/brief-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { Brief } from '../../../core/services/models/brief.model'; // Ajusté pour pointer vers models
import { Group } from '../../../core/services/models/group.model'; // Ajusté pour pointer vers models

import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';

@Component({
  selector: 'app-brief-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-list.component.html',
  styleUrls: ['./brief-list.component.css'],
})
export class BriefListComponent implements OnInit {
  briefs$: Observable<Brief[]>;
  promos$: Observable<Group[]>;

  private allPromos: Group[] = [];
  isCreateBriefModalOpen: boolean = false;

  currentBriefData: {
    id: string | null;
    name: string; // Sera utilisé pour title ET name si tu n'as pas de champ séparé pour title
    title: string; // Ajouté pour être explicite
    description: string;
    imageUrl: string;
    sourceGroupId: string | number | null;
    promoId: string | number | null; // Ajouté pour être explicite, souvent lié à sourceGroupId
    creationDate: Date | null; // Ajouté pour être explicite
    assignedGroupId: string | number | null;
  } = {
    id: null,
    name: '',
    title: '', // Initialiser
    description: '',
    imageUrl: '',
    sourceGroupId: null,
    promoId: null, // Initialiser
    creationDate: null, // Initialiser
    assignedGroupId: null,
  };

  formError: string | null = null;
  formSuccess: string | null = null;
  isEditMode: boolean = false;
  isConfirmDeleteModalOpen: boolean = false;
  briefToDeleteId: string | null = null;
  briefNameToDelete: string | null = null;

  constructor(
    private briefService: BriefService,
    private promoService: PromoService
  ) {
    this.briefs$ = this.briefService.briefs$;
    this.promos$ = this.promoService.promos$.pipe(
      tap((promos: Group[]) => {
        this.allPromos = promos;
        console.log(
          'Promos stockées localement dans BriefListComponent:',
          this.allPromos
        );
      })
    );
  }

  ngOnInit(): void {
    this.briefs$.subscribe((briefs) => {
      console.log('Briefs chargés depuis BriefService:', briefs);
      if (!briefs || briefs.length === 0) {
        console.warn(
          'Aucun brief chargé depuis BriefService. Vérifiez INITIAL_BRIEFS_DATA dans BriefService.'
        );
      }
    });
    this.promos$.subscribe((promos) => {
      console.log(
        'Promos (pour la sélection de sourceGroupId) chargées depuis PromoService:',
        promos
      );
      if (!promos || promos.length === 0) {
        console.warn(
          'Aucune promo chargée depuis PromoService. La sélection de la promo source dans la modale sera vide.'
        );
      }
    });
  }

  openCreateBriefModal(): void {
    this.isEditMode = false;
    this.isCreateBriefModalOpen = true;
    this.currentBriefData = {
      id: null,
      name: '',
      title: '', // Réinitialiser
      description: '',
      imageUrl: '',
      sourceGroupId: null,
      promoId: null, // Réinitialiser
      creationDate: null, // Réinitialiser
      assignedGroupId: null,
    };
    this.formError = null;
    this.formSuccess = null;
  }

  openEditBriefModal(brief: Brief): void {
    this.isEditMode = true;
    this.isCreateBriefModalOpen = true;
    this.currentBriefData = {
      id: brief.id,
      name: brief.name, // Ou brief.title si c'est la source de vérité
      title: brief.title, // Pré-remplir
      description: brief.description,
      imageUrl: brief.imageUrl || '',
      sourceGroupId: brief.sourceGroupId,
      promoId: brief.promoId, // Pré-remplir
      creationDate: brief.creationDate, // Pré-remplir
      assignedGroupId: brief.assignedGroupId || null,
    };
    this.formError = null;
    this.formSuccess = null;
    console.log(
      'Ouverture modale pour édition, currentBriefData:',
      this.currentBriefData
    );
  }

  closeCreateBriefModal(): void {
    this.isCreateBriefModalOpen = false;
    this.isEditMode = false;
  }

  onSaveBriefSubmit(): void {
    this.formError = null;
    this.formSuccess = null;

    // --- AJOUT/MODIFICATION : Utiliser currentBriefData.title ---
    if (
      !this.currentBriefData.title.trim() ||
      !this.currentBriefData.description.trim()
    ) {
      this.formError = 'Le titre et la description du brief sont obligatoires.';
      return;
    }

    // --- MODIFICATION : Utiliser currentBriefData.promoId (qui devrait être lié à sourceGroupId) ---
    // On suppose que sourceGroupId EST le promoId pour un nouveau brief.
    // Tu devras t'assurer que `this.currentBriefData.sourceGroupId` est bien l'ID de la promo
    // sélectionnée dans ton formulaire.
    if (
      this.currentBriefData.sourceGroupId === null ||
      this.currentBriefData.sourceGroupId === undefined
    ) {
      this.formError = 'Veuillez assigner ce brief à une promo source.';
      return;
    }
    // Pour la clarté, on assigne explicitement promoId
    this.currentBriefData.promoId = this.currentBriefData.sourceGroupId;

    // --- MODIFICATION : S'assurer que title, promoId, creationDate sont dans le payload ---
    // `name` dans ton modèle Brief est peut-être redondant si tu as `title`.
    // Je vais supposer que `title` est le champ principal et que `name` peut être le même.
    // Si `name` a un rôle différent, ajuste en conséquence.

    // Préparer l'objet brief avec les données du formulaire
    const briefPayloadForService: Omit<Brief, 'id'> = {
      name: this.currentBriefData.title, // Utilise title pour name, ou ajuste si 'name' est différent.
      title: this.currentBriefData.title,
      description: this.currentBriefData.description,
      promoId: String(this.currentBriefData.promoId), // Assure-toi que c'est une string si ton modèle l'attend
      creationDate: new Date(), // Toujours une nouvelle date à la création/sauvegarde pour cet exemple
      imageUrl: this.currentBriefData.imageUrl || undefined,
      sourceGroupId: this.currentBriefData.sourceGroupId,
      assignedGroupId: this.currentBriefData.assignedGroupId, // Ceci est optionnel dans ton modèle Brief
    };

    if (this.isEditMode && this.currentBriefData.id) {
      // LOGIQUE DE MODIFICATION
      // Pour la mise à jour, on voudrait peut-être ne pas changer la creationDate
      // et on a besoin de l'ID.
      const briefToUpdate: Brief = {
        ...briefPayloadForService, // Contient déjà name, title, desc, promoId, imageUrl, sourceGroupId, assignedGroupId
        id: this.currentBriefData.id,
        creationDate: this.currentBriefData.creationDate || new Date(), // Conserve la date de création existante ou une nouvelle si absente
      };
      console.log(
        'SIMULATION: Prêt à appeler briefService.updateBrief() avec:',
        briefToUpdate
      );
      this.briefService.updateBrief(briefToUpdate);
      this.formSuccess = `Brief '${briefToUpdate.title}' (simulation) modifié ! Vérifiez la console.`;
    } else {
      // LOGIQUE DE CRÉATION
      console.log(
        'Appel de briefService.addBrief() avec:',
        briefPayloadForService
      );
      // Utilise promoId comme targetPromoId et sourceGroupId comme sourcePromoId
      this.briefService.addBrief(
        {
          name: briefPayloadForService.name,
          title: briefPayloadForService.title,
          description: briefPayloadForService.description,
          imageUrl: briefPayloadForService.imageUrl,
        },
        String(this.currentBriefData.promoId),
        String(this.currentBriefData.sourceGroupId)
      );
      this.formSuccess = `Brief '${briefPayloadForService.title}' créé ! Vérifiez la console (ou sera affiché via l'Observable).`;
    }

    setTimeout(() => {
      this.closeCreateBriefModal();
    }, 2000);
  }

  openConfirmDeleteModal(
    briefId: string,
    briefName: string,
    event: MouseEvent
  ): void {
    event.stopPropagation();
    this.briefToDeleteId = briefId;
    this.briefNameToDelete = briefName;
    this.isConfirmDeleteModalOpen = true;
  }

  closeConfirmDeleteModal(): void {
    this.isConfirmDeleteModalOpen = false;
    this.briefToDeleteId = null;
    this.briefNameToDelete = null;
  }

  confirmDeleteBrief(): void {
    if (this.briefToDeleteId) {
      console.log(
        'SIMULATION: Prêt à appeler briefService.deleteBrief() avec ID:',
        this.briefToDeleteId
      );
      this.briefService.deleteBrief(this.briefToDeleteId);
      this.formSuccess = `Brief (ID: ${this.briefToDeleteId}) (simulation) supprimé ! Vérifiez la console.`;
      this.closeConfirmDeleteModal();
    }
    setTimeout(() => {
      this.formSuccess = null;
      this.formError = null;
    }, 2500);
  }
}
