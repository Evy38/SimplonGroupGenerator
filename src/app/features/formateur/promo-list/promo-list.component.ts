// src/app/features/formateur/promo-list/promo-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Si tu as des routerLink dans le template
import { FormsModule } from '@angular/forms';   // Pour [(ngModel)]
import { Subscription } from 'rxjs';

import { Group } from '../../../core/services/models/group.model';   // Représente une "Promo"
import { Person } from '../../../core//services/models/person.model';
import { PromoService } from '../../../core/services/promo.service';

// SIMULATION: Liste de TOUTES les personnes disponibles dans le système pour être ajoutées aux promos.
// Idéalement, cela viendrait d'un PersonService ou d'une autre source de données.
const ALL_SYSTEM_PEOPLE:  Person[] = [ // <--- ICI SONT DÉFINIS TES APPRENANTS (PERSONNES)
  { id: 'p1', nom: 'Alice Lemaire (Poney/Chaton)', email: 'alice@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 3, profil: 'alaise', age: 28 },
  { id: 'p2', nom: 'Bob Martin (Poney)', email: 'bob@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 2, profil: 'reserve', age: 22 },
  { id: 'p3', nom: 'Charlie Durand (Marmotte)', email: 'charlie@mail.com', genre: 'nsp', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 4, profil: 'timide', age: 30 },
  { id: 'p4', nom: 'Diana Pires (Marmotte/Chaton)', email: 'diana@mail.com', genre: 'feminin', aisanceFrancais: 2, ancienDWWM: false, niveauTechnique: 1, profil: 'alaise', age: 25 },
  { id: 'p5', nom: 'Émile Petit (Marmotte)', email: 'emile@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: true, niveauTechnique: 2, profil: 'reserve', age: 27 },
  { id: 'p6', nom: 'Fiona Guyot (Poney/Chaton)', email: 'fiona@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: false, niveauTechnique: 3, profil: 'alaise', age: 24 },
  { id: 'p7', nom: 'Gaspard Roux', email: 'gaspard@mail.com', genre: 'masculin', aisanceFrancais: 2, ancienDWWM: false, niveauTechnique: 1, profil: 'timide', age: 29 },
  { id: 'p8', nom: 'Hélène Claire', email: 'helene@mail.com', genre: 'feminin', aisanceFrancais: 3, ancienDWWM: true, niveauTechnique: 3, profil: 'reserve', age: 26 },
  {
    id: 'p-apprenant-test', // ID unique
    nom: 'Apprenant Test User',
    email: 'apprenant@test.com', // Email correspondant à votre mockUser dans AuthService
    genre: 'nsp',
    aisanceFrancais: 3,
    ancienDWWM: false,
    niveauTechnique: 2,
    profil: 'reserve',
    age: 25
  }
];
@Component({
  selector: 'app-promo-list', // Nouveau sélecteur
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promo-list.component.html', // Nouveau nom de fichier HTML
  styleUrls: ['./promo-list.component.css']  // Nouveau nom de fichier CSS
})
export class PromoListComponent implements OnInit, OnDestroy {
  promos: Group[] = []; // Stocke les promos venant du service (Group représente une Promo ici)
  private promosSubscription: Subscription | undefined;

  // État pour la modale de création ou d'édition
  isCreateOrEditModalOpen: boolean = false;
  isEditMode: boolean = false;
  // Données du formulaire pour la promo en cours de création/édition
  // '!' indique à TypeScript qu'elle sera initialisée avant usage (dans open...Modal)
  currentPromoData!: { id?: string | number, name: string, imageUrl?: string, members: Person[] };

  // Pour la gestion des membres dans la modale
  allAvailablePeopleForSelection: Person[] = [...ALL_SYSTEM_PEOPLE]; // Copie pour la sélection
  newPersonInput: string = ''; // Pour l'input de recherche/ajout de personnes

  // Messages pour le formulaire
  formError: string | null = null;
  formSuccess: string | null = null;

  // Pour la modale de confirmation de suppression
  isConfirmDeleteModalOpen: boolean = false;
  promoToDelete: Group | null = null;

   // Pour la modale d'affichage des membres d'une PROMO
  isPromoMembersModalOpen: boolean = false;
  selectedPromoForMembers: Group | null = null;

  constructor(private promoService: PromoService) {}

 ngOnInit(): void {
    this.promosSubscription = this.promoService.promos$.subscribe(data => {
      this.promos = data;
    });
  }

  // --- GESTION DE LA MODALE DE CRÉATION/ÉDITION DE PROMO ---
  openCreatePromoModal(): void {
    this.isEditMode = false; // Mode création
    // Initialiser currentPromoData pour une nouvelle promo
    this.currentPromoData = {
      name: '', // Nom vide pour commencer
      imageUrl: '',
      members: [] // Liste de membres vide pour commencer
    };
    this.formError = null;
    this.formSuccess = null;
    this.newPersonInput = '';
    this.isCreateOrEditModalOpen = true;
  }

  openEditPromoModal(promoToEdit: Group): void {
    this.isEditMode = true; // Mode édition
    // Copie profonde de la promo pour éviter de modifier l'original avant la sauvegarde
    this.currentPromoData = JSON.parse(JSON.stringify(promoToEdit));
    this.formError = null;
    this.formSuccess = null;
    this.newPersonInput = '';
    this.isCreateOrEditModalOpen = true;
  }

  closeCreateOrEditModal(): void {
    this.isCreateOrEditModalOpen = false;
    // Réinitialiser isEditMode au cas où
    this.isEditMode = false;
  }

  onSavePromoSubmit(): void {
    this.formError = null;
    this.formSuccess = null;

    if (!this.currentPromoData.name.trim()) {
      this.formError = "Le nom de la promo est obligatoire.";
      return;
    }
    // Tu pourrais ajouter d'autres validations ici (ex: au moins un membre)

    if (this.isEditMode && this.currentPromoData.id) {
      // Logique de MODIFICATION d'une promo existante
      const promoToUpdate: Group = {
        id: this.currentPromoData.id,
        name: this.currentPromoData.name.trim(),
        members: this.currentPromoData.members.map(m => ({ ...m })), // Copie des membres
        imageUrl: this.currentPromoData.imageUrl?.trim() || undefined
      };
      this.promoService.updatePromo(promoToUpdate); // Appel au service
      this.formSuccess = `Promo "${promoToUpdate.name}" modifiée avec succès.`;
      console.log('Promo modifiée:', promoToUpdate);
    } else {
      // Logique de CRÉATION d'une nouvelle promo
      const newPromoPayload: Omit<Group, 'id'> = {
        name: this.currentPromoData.name.trim(),
        members: this.currentPromoData.members.map(m => ({ ...m })),
        imageUrl: this.currentPromoData.imageUrl?.trim() || undefined
      };
      const createdPromo = this.promoService.addPromo(newPromoPayload); // Appel au service
      this.formSuccess = `Promo "${createdPromo.name}" créée avec succès.`;
      console.log('Promo créée:', createdPromo);
    }

    // Fermer la modale après un court délai pour voir le message de succès
    setTimeout(() => {
      this.closeCreateOrEditModal();
      this.formSuccess = null; // Réinitialiser le message
    }, 1500);
  }

  // --- GESTION DES MEMBRES DANS LA MODALE D'ÉDITION/CRÉATION DE PROMO ---
  removePersonFromCurrentPromo(personToRemove: Person): void {
    if (this.currentPromoData) {
      this.currentPromoData.members = this.currentPromoData.members.filter(
        p => p.id !== personToRemove.id
      );
    }
  }

  addPersonToCurrentPromo(personToAdd: Person): void {
    if (this.currentPromoData && !this.currentPromoData.members.find(m => m.id === personToAdd.id)) {
      this.currentPromoData.members = [...this.currentPromoData.members, { ...personToAdd }];
    }
    this.newPersonInput = ''; // Vider l'input de recherche après ajout
  }

  // Logique pour ajouter une personne via l'input texte (nom ou email)
  addPersonFromInput(): void {
    const searchTerm = this.newPersonInput.trim().toLowerCase();
    if (!searchTerm) return;

    const personFound = this.allAvailablePeopleForSelection.find(p =>
      p.nom.toLowerCase().includes(searchTerm) ||
      (p.email && p.email.toLowerCase().includes(searchTerm))
    );

    if (personFound) {
      this.addPersonToCurrentPromo(personFound);
    } else {
      // Optionnel: gérer le cas où la personne n'est pas trouvée ou permettre de créer un "invité"
      this.formError = `Personne "${this.newPersonInput}" non trouvée dans la liste des personnes disponibles.`;
      console.warn(`Personne non trouvée: ${this.newPersonInput}`);
    }
    // this.newPersonInput = ''; // Déjà fait dans addPersonToCurrentPromo si succès
  }

  // Filtre les personnes de ALL_SYSTEM_PEOPLE qui ne sont pas déjà dans la promo en cours d'édition/création
  getAvailablePeopleForSelection(): Person[] {
    if (!this.currentPromoData || !this.currentPromoData.members) {
      return [...this.allAvailablePeopleForSelection]; // Retourne une copie de toutes les personnes
    }
    const currentMemberIds = new Set(this.currentPromoData.members.map(m => m.id));
    return this.allAvailablePeopleForSelection.filter(p => !currentMemberIds.has(p.id));
  }

   // --- NOUVEAU: GESTION MODALE AFFICHAGE MEMBRES D'UNE PROMO ---
  openPromoMembersModal(promo: Group): void {
    console.log('Ouverture modale membres pour la promo:', promo.name); // LOG DE DÉBOGAGE
    this.selectedPromoForMembers = promo;
    this.isPromoMembersModalOpen = true;
    console.log('isPromoMembersModalOpen est maintenant:', this.isPromoMembersModalOpen); // LOG DE DÉBOGAGE
  }

  closePromoMembersModal(): void {
    this.isPromoMembersModalOpen = false;
    this.selectedPromoForMembers = null;
  }


  // --- GESTION DE LA MODALE DE CONFIRMATION DE SUPPRESSION DE PROMO ---
  openConfirmDeletePromoModal(promo: Group): void {
    this.promoToDelete = promo;
    this.isConfirmDeleteModalOpen = true;
  }

  closeConfirmDeletePromoModal(): void {
    this.isConfirmDeleteModalOpen = false;
    this.promoToDelete = null;
  }

  confirmDeletePromo(): void {
    if (this.promoToDelete && this.promoToDelete.id) {
      this.promoService.deletePromo(this.promoToDelete.id); // Appel au service
      console.log('Promo supprimée:', this.promoToDelete.name);
      this.closeConfirmDeletePromoModal();
    }
  }

  // NÉCESSAIRE: Se désabonner pour éviter les fuites de mémoire
  ngOnDestroy(): void {
    this.promosSubscription?.unsubscribe();
  }
}