// src/app/features/formateur/brief-detail/brief-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';


import { Brief } from '../../../core/services/models/brief.model';
import { Group } from '../../../core/services/models/group.model';   // Représente nos "Promos"
import { Person } from '../../../core/services/models/person.model';
import { PromoService } from '../../../core/services/promo.service';

// MOCK_BRIEFS (peut rester ici ou être mis dans un BriefService plus tard)
const MOCK_BRIEFS: Brief[] = [
  { id: 'brf1', name: 'Portfolio Poneys', description: 'Création d\'un portfolio personnel interactif pour démontrer vos compétences acquises durant la formation.', imageUrl: 'assets/portfolio.png', sourceGroupId: 'grpPoneys' },
  { id: 'brf2', name: 'App To-do List Marmottes', description: 'Développer une application web complète de gestion de tâches avec des fonctionnalités CRUD et une interface utilisateur intuitive.', imageUrl: 'assets/taches.png', sourceGroupId: 'grpMarmottes' },
  { id: 'brf3', name: 'E-commerce Chatons', description: 'Reproduire les fonctionnalités de base : publication de messages courts, suivi d\'utilisateurs, et affichage d\'un fil d\'actualité.',imageUrl: 'assets/twitter-clone.png', sourceGroupId: 'grpChatons' },
];
// --- FIN MOCK_BRIEFS ---


@Component({
  selector: 'app-brief-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-detail.component.html',
  styleUrls: ['./brief-detail.component.css']
})
export class BriefDetailComponent implements OnInit, OnDestroy {
  brief: Brief | undefined;
  sourceGroupForBrief: Group | undefined; // La "Promo" (objet Group) assignée à ce brief
  generatedWorkGroups: Group[] = [];    // Les sous-groupes de travail générés pour ce brief

  // Pour la modale de génération de groupes (le "dé")
  isGenerateGroupsModalOpen: boolean = false;
  generationCriteria = {
    peoplePerGroup: 2,
    mixAncienDWWM: false, mixGenre: false, mixAisanceFrancais: false,
    mixNiveauTechnique: false, mixProfil: false, mixAge: false
  };
  generationError: string | null = null;

  // NOUVEAU / RÉACTIVÉ: Pour la modale d'affichage des membres d'un sous-groupe de travail
  isMembersModalOpen: boolean = false;
  selectedWorkGroupForMembers: Group | null = null; // Le sous-groupe dont on affiche les membres

  // Pour la modale de modification d'un sous-groupe de travail
  isEditWorkGroupModalOpen: boolean = false;
  selectedWorkGroupToEdit: Group | null = null;
  editableWorkGroupData!: { id: string | number, name: string, members: Person[], imageUrl?: string };
  editWorkGroupError: string | null = null;
  newPersonInput: string = '';

  // Pour la modale de confirmation de suppression d'un sous-groupe de travail
  isDeleteWorkGroupConfirmModalOpen: boolean = false;
  workGroupToDelete: Group | null = null;

  private routeSubscription: Subscription | undefined;
  private promoSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promoService: PromoService // Injecter PromoService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const briefIdFromRoute = params.get('id');
      if (briefIdFromRoute) {
        this.loadBriefAndItsSourceGroup(briefIdFromRoute);
      } else {
        console.error("ID du brief manquant dans l'URL");
        this.router.navigate(['/formateur/briefs']);
      }
    });
  }

  loadBriefAndItsSourceGroup(briefId: string): void {
    // 1. Charger le brief (simulation)
    this.brief = MOCK_BRIEFS.find(b => b.id === briefId);

    if (!this.brief) {
      console.error(`Brief avec l'ID ${briefId} non trouvé.`);
      this.router.navigate(['/formateur/briefs']);
      return;
    }

    if (this.brief.sourceGroupId) {
      // Se désabonner de l'abonnement précédent à la promo s'il existe
      this.promoSubscription?.unsubscribe();
      // S'abonner pour obtenir la promo source et ses mises à jour
      this.promoSubscription = this.promoService.getPromoById(this.brief.sourceGroupId).subscribe(promo => {
        if (promo) {
          this.sourceGroupForBrief = promo; // Stocker la promo récupérée
          console.log(`Promo source "${this.sourceGroupForBrief.name}" chargée pour le brief "${this.brief?.name}". Contient ${this.sourceGroupForBrief.members.length} membres.`);
          this.simulateInitialGroupGeneration(); // Simuler la génération avec la promo à jour
        } else {
          console.error(`La Promo (groupe source) avec ID ${this.brief!.sourceGroupId} n'a pas été trouvée.`);
          this.sourceGroupForBrief = undefined;
          this.generatedWorkGroups = [];
        }
      });
    } else {
      console.warn(`Aucune promo (sourceGroupId) n'est assignée au brief ${this.brief.name}`);
      this.sourceGroupForBrief = undefined;
      this.generatedWorkGroups = [];
    }
  }

  simulateInitialGroupGeneration(): void {
    if (this.sourceGroupForBrief && this.sourceGroupForBrief.members.length > 0) {
      const criteriaForSample = {
        peoplePerGroup: Math.min(2, this.sourceGroupForBrief.members.length),
        mixAncienDWWM: false, // Mettre un critère à false pour la simu initiale simple
        mixGenre: false, mixAisanceFrancais: false,
        mixNiveauTechnique: false, mixProfil: false, mixAge: false
      };
       if (this.sourceGroupForBrief.members.length >= criteriaForSample.peoplePerGroup && criteriaForSample.peoplePerGroup > 0) {
         this.generateGroupsLogic(this.sourceGroupForBrief.members, criteriaForSample, 2); // Simule 2 groupes
       } else { this.generatedWorkGroups = []; }
    } else { this.generatedWorkGroups = []; }
  }

  // --- MODALE DE GÉNÉRATION DE SOUS-GROUPES (DÉ) ---
  openGenerateGroupsModal(): void {
    if (!this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members || this.sourceGroupForBrief.members.length === 0) {
      alert("Ce brief n'est pas correctement lié à une promo (groupe source) avec des personnes pour la génération.");
      return;
    }
    // Réinitialiser les critères à chaque ouverture
    this.generationCriteria = {
      peoplePerGroup: Math.min(3, this.sourceGroupForBrief.members.length),
      mixAncienDWWM: false,
      mixGenre: false,
      mixAisanceFrancais: false,
      mixNiveauTechnique: false,
      mixProfil: false,
      mixAge: false
    };
    this.generationError = null;
    this.isGenerateGroupsModalOpen = true;
  }

  closeGenerateGroupsModal(): void {
    this.isGenerateGroupsModalOpen = false;
  }

  onGenerateGroupsSubmit(): void {
    this.generationError = null;
    if (!this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members || this.sourceGroupForBrief.members.length === 0) {
      this.generationError = "Données du brief ou de la promo source (groupe) manquantes.";
      return;
    }
    const sourcePeople = this.sourceGroupForBrief.members;
    if (this.generationCriteria.peoplePerGroup <= 0 || sourcePeople.length < this.generationCriteria.peoplePerGroup) {
      this.generationError = `Vérifiez le nombre de personnes par groupe (min 1, max ${sourcePeople.length} pour cette promo).`;
      return;
    }
    console.log('Génération de sous-groupes avec critères :', this.generationCriteria, 'à partir de la promo:', this.sourceGroupForBrief.name);
    this.generateGroupsLogic(sourcePeople, this.generationCriteria); // Appel de la logique de génération
    if (this.generatedWorkGroups.length > 0) {
        // alert(`${this.generatedWorkGroups.length} sous-groupes de travail ont été générés.`); // Peut-être pas d'alert ici
        console.log(`${this.generatedWorkGroups.length} sous-groupes de travail ont été générés.`);
    } else {
        this.generationError = "Aucun sous-groupe n'a pu être généré avec ces paramètres.";
    }
    this.closeGenerateGroupsModal();
  }

  private generateGroupsLogic(
    peopleInSourceGroup: Person[],
    criteria: typeof this.generationCriteria,
    numberOfWorkGroupsToSimulate?: number // Optionnel, pour la simulation initiale
  ): void {
    let availablePeople = JSON.parse(JSON.stringify(peopleInSourceGroup)); // Copie profonde pour ne pas modifier l'original

    for (let i = availablePeople.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePeople[i], availablePeople[j]] = [availablePeople[j], availablePeople[i]];
    }

    const newWorkGroups: Group[] = [];
    let workGroupCounter = 1;
    // Si numberOfWorkGroupsToSimulate est fourni, on essaie de créer ce nombre de groupes.
    // Sinon, on crée autant de groupes que possible avec la taille demandée.
    const groupsToAttempt = numberOfWorkGroupsToSimulate || Math.floor(availablePeople.length / criteria.peoplePerGroup);

    for (let i = 0; i < groupsToAttempt; i++) {
      if (availablePeople.length < criteria.peoplePerGroup) {
        if (numberOfWorkGroupsToSimulate && availablePeople.length > 0) {
          // Pour la simulation, si on demande N groupes et qu'il reste des gens, on fait un dernier groupe plus petit
          const membersForNewWorkGroup = availablePeople.splice(0, availablePeople.length);
           newWorkGroups.push({
            id: `brief-${this.brief!.id}-wg-${Date.now()}-${workGroupCounter}`,
            name: `Équipe ${workGroupCounter} (reste)`,
            members: membersForNewWorkGroup
          });
          workGroupCounter++;
        }
        break; // Plus assez de personnes pour un groupe complet de la taille demandée
      }

      // TODO: Implémenter la sélection des membres basée sur les criteria.mix...
      // Pour l'instant, on prend juste les X premières personnes.
      const membersForNewWorkGroup = availablePeople.splice(0, criteria.peoplePerGroup);
      newWorkGroups.push({
        id: `brief-${this.brief!.id}-wg-${Date.now()}-${workGroupCounter}`,
        name: `Équipe ${workGroupCounter}`, // Nom simple pour le sous-groupe
        members: membersForNewWorkGroup,
        // imageUrl: // Pas d'image pour les sous-groupes de travail
      });
      workGroupCounter++;
    }
    this.generatedWorkGroups = newWorkGroups; // Affecter la nouvelle liste de groupes générés
    console.log('Sous-groupes de travail générés:', this.generatedWorkGroups);
  }

  // --- MODALE POUR AFFICHER LES MEMBRES D'UN SOUS-GROUPE DE TRAVAIL ---
  openWorkGroupMembersModal(workGroup: Group, event: MouseEvent): void {
    event.stopPropagation(); // Empêche le clic sur la carte de déclencher autre chose (comme une navigation si la carte était un lien)
    this.selectedWorkGroupForMembers = workGroup;
    this.isMembersModalOpen = true;
  }

  closeWorkGroupMembersModal(): void {
    this.isMembersModalOpen = false;
    this.selectedWorkGroupForMembers = null;
  }

  // --- MODALE DE MODIFICATION D'UN SOUS-GROUPE DE TRAVAIL ---
  openEditWorkGroupModal(workGroup: Group, event?: MouseEvent): void {
    event?.stopPropagation();
    this.selectedWorkGroupToEdit = workGroup;
    this.editableWorkGroupData = JSON.parse(JSON.stringify(workGroup)); // Copie profonde pour l'édition
    this.editWorkGroupError = null;
    this.newPersonInput = '';
    this.isEditWorkGroupModalOpen = true;
  }

  closeEditWorkGroupModal(): void {
    this.isEditWorkGroupModalOpen = false;
    this.selectedWorkGroupToEdit = null;
    // this.editableWorkGroupData n'a pas besoin d'être nullifié ici, sera réécrit à la prochaine ouverture
  }

  onSaveWorkGroupChanges(): void {
    if (!this.editableWorkGroupData || !this.selectedWorkGroupToEdit) {
      this.editWorkGroupError = "Erreur: Aucune donnée de groupe à sauvegarder.";
      return;
    }
    if (!this.editableWorkGroupData.name.trim()) {
      this.editWorkGroupError = "Le nom du groupe ne peut pas être vide.";
      return;
    }

    const groupIndex = this.generatedWorkGroups.findIndex(g => g.id === this.selectedWorkGroupToEdit!.id);
    if (groupIndex > -1) {
      const updatedGroups = [...this.generatedWorkGroups];
      // Appliquer les modifications de editableWorkGroupData au groupe dans updatedGroups
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex], // Conserver l'ID et autres propriétés non modifiables directement
        name: this.editableWorkGroupData.name,
        members: JSON.parse(JSON.stringify(this.editableWorkGroupData.members)), // Copie profonde des membres
        imageUrl: this.editableWorkGroupData.imageUrl // Mettre à jour l'URL de l'image aussi
      };
      this.generatedWorkGroups = updatedGroups; // Mettre à jour la liste principale
      console.log('Sous-groupe de travail modifié:', this.generatedWorkGroups[groupIndex]);
    } else {
      this.editWorkGroupError = "Erreur: Le sous-groupe à modifier n'a pas été trouvé.";
    }
    this.closeEditWorkGroupModal();
  }

  removeMemberFromEditableGroup(memberToRemove: Person): void {
    if (this.editableWorkGroupData) {
      this.editableWorkGroupData.members = this.editableWorkGroupData.members.filter(m => m.id !== memberToRemove.id);
    }
  }

  addPersonToEditableGroup(personToAdd: Person): void {
    if (this.editableWorkGroupData && !this.editableWorkGroupData.members.find(m => m.id === personToAdd.id)) {
      this.editableWorkGroupData.members = [...this.editableWorkGroupData.members, JSON.parse(JSON.stringify(personToAdd))];
    }
  }

  addPersonFromInput(): void {
    if (!this.newPersonInput.trim() || !this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members) {
      this.editWorkGroupError = "Veuillez saisir une recherche et s'assurer que le brief a une promo source.";
      return;
    }
    // Utiliser les membres de la promo source pour la recherche
    const promoSourcePeople = this.sourceGroupForBrief.members;
    const searchTerm = this.newPersonInput.trim().toLowerCase();
    const personFound = promoSourcePeople.find(p =>
      p.nom.toLowerCase().includes(searchTerm) || (p.email && p.email.toLowerCase().includes(searchTerm))
    );
    if (personFound) {
      this.addPersonToEditableGroup(personFound); // Appel de la méthode qui gère la copie et la non-duplication
      this.newPersonInput = '';
    } else {
      this.editWorkGroupError = `Personne "${this.newPersonInput}" non trouvée dans la promo "${this.sourceGroupForBrief.name}".`;
    }
  }

  getAvailablePeopleForEditingGroup(): Person[] {
    if (!this.sourceGroupForBrief || !this.sourceGroupForBrief.members || !this.editableWorkGroupData) {
      return [];
    }
    const currentMemberIds = new Set(this.editableWorkGroupData.members.map(m => m.id));
    return this.sourceGroupForBrief.members.filter(p => !currentMemberIds.has(p.id));
  }

  // --- MODALE DE CONFIRMATION DE SUPPRESSION D'UN SOUS-GROUPE DE TRAVAIL ---
  openDeleteWorkGroupConfirmModal(workGroup: Group, event?: MouseEvent): void {
    event?.stopPropagation();
    this.workGroupToDelete = workGroup;
    this.isDeleteWorkGroupConfirmModalOpen = true;
  }

  closeDeleteWorkGroupConfirmModal(): void {
    this.isDeleteWorkGroupConfirmModalOpen = false;
    this.workGroupToDelete = null;
  }

  confirmDeleteWorkGroup(): void {
    if (this.workGroupToDelete) {
      this.generatedWorkGroups = this.generatedWorkGroups.filter(g => g.id !== this.workGroupToDelete!.id);
      console.log('Sous-groupe de travail supprimé:', this.workGroupToDelete.name);
      this.closeDeleteWorkGroupConfirmModal();
    }
  }

  ngOnDestroy(): void {
    this.routeSubscription?.unsubscribe();
    this.promoSubscription?.unsubscribe();
  }
}