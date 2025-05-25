// src/app/features/formateur/brief-list/brief-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Brief } from '../../../core/services/models/brief.model'; // Ajuste le chemin
import { Group } from '../../../core/services/models/group.model'; // Pour la sélection de groupe
// Tu auras besoin d'un service pour charger les groupes existants
import { PromoService } from '../../../core/services/promo.service'; 

@Component({
  selector: 'app-brief-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-list.component.html',
  styleUrls: ['./brief-list.component.css'] // Pluriel pour styleUrls
})
export class BriefListComponent implements OnInit {
  briefs: Brief[] = [];
  isCreateBriefModalOpen: boolean = false;

  // Pour le formulaire de création/modification de brief
  currentBriefData = {
    name: '',
    description: '',
    imageUrl: '',
    assignedGroupId: null as (number | string | null) // Pour l'ID du groupe sélectionné
  };

  availableGroups: Group[] = []; // Liste des groupes existants à affilier

  formError: string | null = null;
  formSuccess: string | null = null;

  isEditMode: boolean = false;
  briefToEdit: Brief | null = null;

  isConfirmDeleteModalOpen: boolean = false;
  briefToDelete: Brief | null = null;

  // Pas de modale de confirmation de suppression pour l'instant, on peut l'ajouter plus tard

  constructor(
    // private groupService: GroupService // Exemple: injecter un service pour les groupes
  ) { }

  ngOnInit(): void {
    this.loadBriefs();
    this.loadAvailableGroups(); // Charger les groupes pour la sélection
  }

  loadBriefs(): void {
    // Données simulées (plus tard, viendra d'un service)
    this.briefs = [
      {
        id: 'brf1',
        name: 'Projet Portfolio V1',
        description: 'Création d\'un portfolio pour présenter les projets...', // Votre description
        imageUrl: 'assets/portfolio.png', // Assurez-vous que ce chemin est correct ou gérez-le
        assignedGroupId: 'grp2',
        sourceGroupId: 'idGroupeSourcePourBrf1' // <--- AJOUTEZ CECI (avec une valeur appropriée)
      },
      {
        id: 'brf2',
        name: 'Application de Gestion de Tâches',
        description: 'Développement d\'une application web pour la gestion...', // Votre description
        imageUrl: 'assets/taches.png', // Assurez-vous que ce chemin est correct ou gérez-le
        // assignedGroupId: 'valeurSiApplicable', // S'il y en a un
        sourceGroupId: 'idGroupeSourcePourBrf2' // <--- AJOUTEZ CECI (avec une valeur appropriée)
      },
      {
        id: 'brf3',
        name: 'Clone de Twitter (Simplifié)',
        description: 'Reproduction des fonctionnalités principales de la plateforme...', // Votre description
        imageUrl: 'assets/twitter.png', // Assurez-vous que ce chemin est correct ou gérez-le
        assignedGroupId: 'grp1',
        sourceGroupId: 'idGroupeSourcePourBrf3' // <--- AJOUTEZ CECI (avec une valeur appropriée)
      },
      // ... autres briefs
    ];
  }

  loadAvailableGroups(): void {
    // Simuler la récupération des groupes existants.
    // Dans une vraie app, cela viendrait d'un GroupService qui récupère this.groups de GroupListComponent ou une source de données.
    // Pour la démo, on peut copier quelques groupes ici ou créer une source partagée (via un service).
    // Supposons que tu as une liste de groupes quelque part :
    const person1 = { id: 1, nom: 'P1' }; const person2 = { id: 2, nom: 'P2' };
    this.availableGroups = [
      { id: 'grp1', name: 'Les Marmottes', members: [person1, person2] },
      { id: 'grp2', name: 'Les Poneys', members: [person1] },
      { id: 'grp3', name: 'Les Chatons', members: [person2] },
    ];
  }

  // --- Gestion de la modale de création/modification de Brief ---
  openCreateBriefModal(): void {
    this.isEditMode = false;
    this.briefToEdit = null;
    this.isCreateBriefModalOpen = true;
    this.currentBriefData = { name: '', description: '', imageUrl: '', assignedGroupId: null };
    this.formError = null;
    this.formSuccess = null;
  }

  openEditBriefModal(brief: Brief): void {
    this.isEditMode = true;
    this.briefToEdit = { ...brief }; // Copie
    this.isCreateBriefModalOpen = true;
    this.currentBriefData = {
      name: brief.name,
      description: brief.description,
      imageUrl: brief.imageUrl || '',
      assignedGroupId: brief.assignedGroupId || null
    };
    this.formError = null;
    this.formSuccess = null;
  }

  closeCreateBriefModal(): void {
    this.isCreateBriefModalOpen = false;
    this.isEditMode = false;
    this.briefToEdit = null;
  }

  onSaveBriefSubmit(): void {
    this.formError = null;
    this.formSuccess = null;

    if (!this.currentBriefData.name.trim() || !this.currentBriefData.description.trim()) {
      this.formError = "Le nom et la description du brief sont obligatoires.";
      return;
    }

    if (this.isEditMode && this.briefToEdit) {
      // --- LOGIQUE DE MODIFICATION ---
      const briefIndex = this.briefs.findIndex(b => b.id === this.briefToEdit!.id);
      if (briefIndex > -1) {
        this.briefs[briefIndex] = {
          ...this.briefs[briefIndex], // Garder l'id et autres props non modifiées
          name: this.currentBriefData.name,
          description: this.currentBriefData.description,
          imageUrl: this.currentBriefData.imageUrl || undefined,
          assignedGroupId: this.currentBriefData.assignedGroupId
        };
        this.formSuccess = `Brief '${this.briefs[briefIndex].name}' modifié !`;
      } else {
        this.formError = "Erreur : Brief à modifier non trouvé.";
      }
    } else {
      // --- LOGIQUE DE CRÉATION ---
      const newId = `brf${Date.now()}`;
      const newBrief: Brief = {
        id: newId,
        name: this.currentBriefData.name,
        description: this.currentBriefData.description,
        imageUrl: this.currentBriefData.imageUrl || undefined,
        assignedGroupId: this.currentBriefData.assignedGroupId,
        sourceGroupId: this.currentBriefData.assignedGroupId ?? '' // Ajout d'une valeur pour sourceGroupId (jamais null)
      };
      this.briefs.push(newBrief);
      this.formSuccess = `Brief '${newBrief.name}' créé !`;
    }

    setTimeout(() => {
      this.closeCreateBriefModal();
      this.formSuccess = null;
      this.formError = null;
    }, 2000);
  }

  // Logique de suppression (simplifiée, sans confirmation pour l'instant)
  deleteBrief(briefId: number | string, event: MouseEvent): void {
    event.stopPropagation(); // Empêche le clic de déclencher la navigation du parent
    // TODO: Ajouter une modale de confirmation ici
    console.log('Suppression demandée pour le brief ID:', briefId);
    this.briefs = this.briefs.filter(b => b.id !== briefId);
  }

  getGroupName(groupId: number | string | null | undefined): string {
    if (!groupId) return 'Aucun groupe assigné';
    const group = this.availableGroups.find(g => g.id === groupId);
    return group ? group.name : 'Groupe inconnu';
  }

  // Méthode pour ouvrir la modale (appelée depuis l'icône poubelle sur une carte de brief)
  openConfirmDeleteModal(briefASupprimer: Brief, event: MouseEvent): void {
    event.stopPropagation();
    this.briefToDelete = briefASupprimer;
    this.isConfirmDeleteModalOpen = true;
  }

  closeConfirmDeleteModal(): void {
    this.isConfirmDeleteModalOpen = false;
    this.briefToDelete = null;
  }

  // Méthode appelée par le bouton "Supprimer" de la modale
  confirmDeleteBrief(): void { // Renommée pour plus de clarté
    if (this.briefToDelete) {
      console.log('Suppression du brief:', this.briefToDelete.name);
      // Logique pour supprimer le brief de ta liste (ou appeler un service)
      this.briefs = this.briefs.filter(b => b.id !== this.briefToDelete!.id);
      this.closeConfirmDeleteModal();
    }
  }

}