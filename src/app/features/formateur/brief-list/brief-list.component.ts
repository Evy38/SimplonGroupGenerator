// src/app/features/formateur/brief-list/brief-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs'; // <-- NOUVEAU: Import pour Observable
import { tap } from 'rxjs/operators';

import { Brief } from '../../../core/services/models/brief.model';         // Ajusté pour pointer vers models et non services/models
import { Group } from '../../../core/services/models/group.model';         // Ajusté pour pointer vers models et non services/models

// --- NOUVEAUX IMPORTS POUR LES SERVICES ---
import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';

@Component({
  selector: 'app-brief-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-list.component.html',
  styleUrls: ['./brief-list.component.css']
})
export class BriefListComponent implements OnInit {
  // --- MODIFICATION: Remplacer les tableaux locaux par des Observables ---
  briefs$: Observable<Brief[]>;      // Anciennement: briefs: Brief[] = [];
  promos$: Observable<Group[]>;      // Anciennement: availableGroups: Group[] = []; (sera utilisé pour les promos sources)

    private allPromos: Group[] = [];
  isCreateBriefModalOpen: boolean = false;

  // --- MODIFICATION: currentBriefData doit inclure 'id' et 'sourceGroupId' ---
  currentBriefData: {
    id: string | null; // Pour savoir si on édite (l'ID du brief) ou crée (null)
    name: string;
    description: string;
    imageUrl: string;
    sourceGroupId: string | number | null; // L'ID de la PROMO SOURCE assignée
    assignedGroupId: string | number | null; // Gardé pour ta logique existante, mais focus sur sourceGroupId
  } = {
    id: null,
    name: '',
    description: '',
    imageUrl: '',
    sourceGroupId: null, // Initialisé à null
    assignedGroupId: null
  };

  formError: string | null = null;
  formSuccess: string | null = null;

  isEditMode: boolean = false;
  // briefToEdit n'est plus aussi central, currentBriefData.id indique le mode édition.
  // On peut le supprimer ou le garder si une logique spécifique en dépend encore.
  // Pour l'instant, je le commente pour simplifier, on se basera sur currentBriefData.id
  // briefToEdit: Brief | null = null;

  isConfirmDeleteModalOpen: boolean = false;
  briefToDeleteId: string | null = null; // On stockera l'ID du brief à supprimer

  briefNameToDelete: string | null = null;

  // --- MODIFICATION: Injection des services ---
constructor(
    private briefService: BriefService,
    private promoService: PromoService
  ) {
    this.briefs$ = this.briefService.briefs$;
    this.promos$ = this.promoService.promos$.pipe(
      tap((promos: Group[]) => {
        this.allPromos = promos; // Stocker la liste des promos quand elle arrive
        console.log('Promos stockées localement dans BriefListComponent:', this.allPromos);
      })
    );
  }

  ngOnInit(): void {
    // --- MODIFICATION: Plus besoin de charger manuellement ---
    // Les données sont maintenant fournies par les Observables briefs$ et promos$.
    // this.loadBriefs(); // Supprimé
    // this.loadAvailableGroups(); // Supprimé

    // Optionnel: Logs pour vérifier que les données arrivent bien des services
    this.briefs$.subscribe(briefs => {
      console.log('Briefs chargés depuis BriefService:', briefs);
      if (!briefs || briefs.length === 0) {
          console.warn("Aucun brief chargé depuis BriefService. Vérifiez INITIAL_BRIEFS_DATA dans BriefService.");
      }
    });
    this.promos$.subscribe(promos => {
      console.log('Promos (pour la sélection de sourceGroupId) chargées depuis PromoService:', promos);
      if (!promos || promos.length === 0) {
          console.warn("Aucune promo chargée depuis PromoService. La sélection de la promo source dans la modale sera vide.");
      }
    });
  }

  
  // --- Gestion de la modale de création/modification de Brief ---
  openCreateBriefModal(): void {
    this.isEditMode = false;
    // this.briefToEdit = null; // Commenté car on se base sur currentBriefData.id
    this.isCreateBriefModalOpen = true;
    // Réinitialise currentBriefData pour une nouvelle création
    this.currentBriefData = {
      id: null, // Important: id est null en mode création
      name: '',
      description: '',
      imageUrl: '',
      sourceGroupId: null, // Important: la promo source n'est pas encore sélectionnée
      assignedGroupId: null
    };
    this.formError = null;
    this.formSuccess = null;
  }

  openEditBriefModal(brief: Brief): void {
    this.isEditMode = true;
    // this.briefToEdit = { ...brief }; // Commenté
    this.isCreateBriefModalOpen = true;
    // Pré-remplit currentBriefData avec les infos du brief à éditer
    this.currentBriefData = {
      id: brief.id, // Important: on stocke l'id du brief
      name: brief.name,
      description: brief.description,
      imageUrl: brief.imageUrl || '',
      sourceGroupId: brief.sourceGroupId, // Important: on récupère la promo source actuelle
      assignedGroupId: brief.assignedGroupId || null
    };
    this.formError = null;
    this.formSuccess = null;
    console.log("Ouverture modale pour édition, currentBriefData:", this.currentBriefData);
  }

  closeCreateBriefModal(): void {
    this.isCreateBriefModalOpen = false;
    this.isEditMode = false;
    // this.briefToEdit = null; // Commenté
  }

  onSaveBriefSubmit(): void {
    this.formError = null;
    this.formSuccess = null;

    if (!this.currentBriefData.name.trim() || !this.currentBriefData.description.trim()) {
      this.formError = "Le nom et la description du brief sont obligatoires.";
      return;
    }
    // --- NOUVELLE VÉRIFICATION: S'assurer qu'une promo source est sélectionnée ---
    if (this.currentBriefData.sourceGroupId === null || this.currentBriefData.sourceGroupId === undefined) {
      this.formError = "Veuillez assigner ce brief à une promo source.";
      return;
    }

    // Préparer l'objet brief avec les données du formulaire
    // On utilise Omit<Brief, 'id'> car l'ID est géré par le service pour la création,
    // ou déjà présent dans currentBriefData.id pour la modification.
    const briefPayload: Omit<Brief, 'id' | 'assignedGroupId'> & { assignedGroupId?: string | number | null, imageUrl?: string } = {
      name: this.currentBriefData.name,
      description: this.currentBriefData.description,
      imageUrl: this.currentBriefData.imageUrl || undefined,
      sourceGroupId: this.currentBriefData.sourceGroupId, // Utilise la valeur de la modale
      // assignedGroupId est optionnel ici, si tu veux le gérer différemment
      // Si tu veux qu'il soit toujours envoyé, même si null:
      assignedGroupId: this.currentBriefData.assignedGroupId
    };

    if (this.isEditMode && this.currentBriefData.id) {
      // --- LOGIQUE DE MODIFICATION ---
      const briefToUpdate: Brief = {
        ...briefPayload,
        id: this.currentBriefData.id // On ajoute l'ID pour la mise à jour
      };
      console.log('SIMULATION: Prêt à appeler briefService.updateBrief() avec:', briefToUpdate);
      // À FAIRE PROCHAINEMENT: this.briefService.updateBrief(briefToUpdate);
      this.formSuccess = `Brief '${briefToUpdate.name}' (simulation) modifié ! Vérifiez la console.`;
    } else {
      // --- LOGIQUE DE CRÉATION ---
      console.log('SIMULATION: Prêt à appeler briefService.addBrief() avec:', briefPayload);
 this.briefService.addBrief(briefPayload as Omit<Brief, 'id'>);
      // Le 'as' est pour typer correctement, car addBrief attendra un objet sans 'id'.
      this.formSuccess = `Brief '${briefPayload.name}' (simulation) créé ! Vérifiez la console.`;
    }

    setTimeout(() => {
      this.closeCreateBriefModal();
      // this.formSuccess = null; // Se réinitialise à la prochaine ouverture
      // this.formError = null;
    }, 2000);
  }

  // Si tu veux afficher le nom de la promo source dans ta liste principale,
  // tu devras passer `promos$ | async` à cette fonction.
  // Pour l'instant, je la commente car elle n'est pas directement utilisée avec `promos$`.
  /*
  getGroupName(groupId: number | string | null | undefined, promos: Group[] | null): string {
    if (!groupId || !promos) return 'Aucun groupe assigné';
    const group = promos.find(g => g.id === groupId);
    return group ? group.name : 'Groupe inconnu';
  }
  */

  // Méthode pour ouvrir la modale de confirmation de suppression
 openConfirmDeleteModal(briefId: string, briefName: string, event: MouseEvent): void { // Ajoute briefName
    event.stopPropagation();
    this.briefToDeleteId = briefId;
    this.briefNameToDelete = briefName; // Stocke le nom
    this.isConfirmDeleteModalOpen = true;
}

 closeConfirmDeleteModal(): void {
    this.isConfirmDeleteModalOpen = false;
    this.briefToDeleteId = null;
    this.briefNameToDelete = null; // Réinitialise
}

  // Méthode appelée par le bouton "Supprimer" de la modale
  confirmDeleteBrief(): void {
    if (this.briefToDeleteId) {
      console.log('SIMULATION: Prêt à appeler briefService.deleteBrief() avec ID:', this.briefToDeleteId);
      this.briefService.deleteBrief(this.briefToDeleteId);
      this.formSuccess = `Brief (ID: ${this.briefToDeleteId}) (simulation) supprimé ! Vérifiez la console.`;
      this.closeConfirmDeleteModal();
      // setTimeout(() => this.formSuccess = null, 2000); // Déplacé pour être plus cohérent
    }
     setTimeout(() => { // Mis ici pour s'assurer qu'il s'exécute après la logique principale
      this.formSuccess = null;
      this.formError = null;
    }, 2500);
  }
}