// src/app/features/formateur/brief-detail/brief-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, switchMap, tap, filter, Observable, of, combineLatest, map } from 'rxjs'; // AJOUT/MODIFICATION DES IMPORTS RXJS

import { Brief } from '../../../core/services/models/brief.model';     // MODIFIÉ: Chemin vers le modèle partagé
import { Group } from '../../../core/services/models/group.model';     // MODIFIÉ: Chemin vers le modèle partagé
import { Person } from '../../../core/services/models/person.model';   // MODIFIÉ: Chemin vers le modèle partagé

import { PromoService } from '../../../core/services/promo.service';
import { BriefService } from '../../../core/services/brief.service'; // <--- NOUVEL IMPORT

// --- MOCK_BRIEFS EST SUPPRIMÉ D'ICI ---

@Component({
  selector: 'app-brief-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-detail.component.html',
  styleUrls: ['./brief-detail.component.css']
})
export class BriefDetailComponent implements OnInit, OnDestroy {
  // --- MODIFICATION: Utilisation d'Observables pour les données principales ---
  brief$: Observable<Brief | undefined>;
  sourceGroupForBrief$: Observable<Group | undefined>;
  // Optionnel: un observable combiné pour faciliter l'accès dans le template
  viewData$: Observable<{ brief: Brief; sourceGroup: Group } | undefined>;


  // Gardons tes propriétés existantes pour la logique interne des modales et de la génération
  brief: Brief | undefined; // Sera alimenté par brief$ pour la logique interne qui ne peut pas utiliser async pipe
  sourceGroupForBrief: Group | undefined; // Sera alimenté par sourceGroupForBrief$

  generatedWorkGroups: Group[] = [];

  isGenerateGroupsModalOpen: boolean = false;
  generationCriteria = {
    peoplePerGroup: 2,
    mixAncienDWWM: false, mixGenre: false, mixAisanceFrancais: false,
    mixNiveauTechnique: false, mixProfil: false, mixAge: false
  };
  generationError: string | null = null;

  isMembersModalOpen: boolean = false;
  selectedWorkGroupForMembers: Group | null = null;

  isEditWorkGroupModalOpen: boolean = false;
  selectedWorkGroupToEdit: Group | null = null;
  editableWorkGroupData!: { id: string | number, name: string, members: Person[], imageUrl?: string };
  editWorkGroupError: string | null = null;
  newPersonInput: string = '';

  isDeleteWorkGroupConfirmModalOpen: boolean = false;
  workGroupToDelete: Group | null = null;

  private collaborationHistory: Map<string, Set<string>> = new Map(); // Historique des paires


  private subscriptions: Subscription = new Subscription(); // Pour gérer tous les abonnements

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promoService: PromoService,
    private briefService: BriefService // <--- INJECTION DE BRIEFSERVICE
  ) {
    const briefIdFromRoute$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => id !== null) // S'assurer que l'ID est une string non nulle
    );

    // 1. Charger le brief via BriefService
    this.brief$ = briefIdFromRoute$.pipe(
      switchMap(briefId => {
        console.log(`BriefDetail: Tentative de chargement du brief avec ID: ${briefId} via BriefService`);
        return this.briefService.getBriefById(briefId);
      }),
      tap(loadedBrief => {
        if (!loadedBrief) {
          console.error(`BriefDetail: Brief non trouvé par BriefService.`);
          this.router.navigate(['/formateur/briefs']); // Rediriger si non trouvé
        } else {
          console.log('BriefDetail: Brief chargé avec succès par BriefService:', loadedBrief);
          this.brief = loadedBrief; // Stocker pour la logique interne
          // Si tu as une logique de chargement des groupes générés sauvegardés, ce serait ici
          // this.loadSavedGeneratedGroups(loadedBrief.id);
          this.simulateInitialGroupGeneration(); // Appeler après que this.brief et potentiellement this.sourceGroupForBrief sont définis
        }
      })
    );

    // 2. Charger la promo source associée au brief
    this.sourceGroupForBrief$ = this.brief$.pipe(
      filter((b): b is Brief => !!b), // Continuer seulement si le brief est chargé
      switchMap(b => {
        if (b.sourceGroupId) {
          console.log(`BriefDetail: Tentative de chargement de la promo source ID: ${b.sourceGroupId}`);
          return this.promoService.getPromoById(b.sourceGroupId.toString()); // Assurer que c'est une string
        }
        return of(undefined); // Pas de sourceGroupId, donc pas de promo source
      }),
      tap(promo => {
        if (promo) {
          console.log('BriefDetail: Promo source chargée:', promo);
          this.sourceGroupForBrief = promo; // Stocker pour la logique interne
          this.simulateInitialGroupGeneration(); // Peut être appelé ici aussi si la promo arrive après le brief
        } else {
          console.warn('BriefDetail: Promo source non trouvée.');
          this.sourceGroupForBrief = undefined;
        }
      })
    );

    // 3. Combiner les données pour le template (optionnel mais pratique)
    this.viewData$ = combineLatest([this.brief$, this.sourceGroupForBrief$]).pipe(
      map(([b, sg]) => {
        if (b && sg) { // S'assurer que les deux sont définis
          return { brief: b, sourceGroup: sg };
        }
        return undefined;
      }),
      tap(data => {
        if (data) {
          // Affecter aux propriétés de classe si des méthodes internes en dépendent directement
          // et ne peuvent pas facilement utiliser les observables.
          this.brief = data.brief;
          this.sourceGroupForBrief = data.sourceGroup;
          // La simulation initiale pourrait être déclenchée ici aussi, une fois que tout est prêt.
          // Assure-toi qu'elle n'est pas appelée plusieurs fois inutilement.
          this.simulateInitialGroupGeneration();
        }
      })
    );
  }

  ngOnInit(): void {
    // Les abonnements principaux sont gérés par les pipes async dans le template.
    // Si tu as besoin de t'abonner explicitement ici pour des effets de bord,
    // ajoute-les à this.subscriptions.
    // Par exemple, si viewData$ n'est pas utilisé avec async pipe mais pour des actions :
    // this.subscriptions.add(this.viewData$.subscribe());

    // L'ancienne logique de loadBriefAndItsSourceGroup est maintenant dans le constructeur via les pipes RxJS.
  }

  // L'ANCIENNE MÉTHODE loadBriefAndItsSourceGroup EST SUPPRIMÉE
  // car la logique est maintenant dans le constructeur avec les Observables.

  simulateInitialGroupGeneration(): void {
    // S'assurer que this.sourceGroupForBrief est bien défini avant de l'utiliser
    if (this.brief && this.sourceGroupForBrief && this.sourceGroupForBrief.members && this.sourceGroupForBrief.members.length > 0) {
      console.log("BriefDetail: Simulation de la génération initiale des groupes...");
      const criteriaForSample = {
        peoplePerGroup: Math.min(2, this.sourceGroupForBrief.members.length),
        mixAncienDWWM: false, mixGenre: false, mixAisanceFrancais: false,
        mixNiveauTechnique: false, mixProfil: false, mixAge: false
      };
      if (this.sourceGroupForBrief.members.length >= criteriaForSample.peoplePerGroup && criteriaForSample.peoplePerGroup > 0) {
        this.generateGroupsLogic(this.sourceGroupForBrief.members, criteriaForSample, 2);
        this.updateCollaborationHistory(this.generatedWorkGroups);
      } else { this.generatedWorkGroups = []; }
    } else {
      // console.log("BriefDetail: Conditions non remplies pour la simulation initiale des groupes (brief, promo source ou membres manquants).");
      this.generatedWorkGroups = [];
    }
  }

  // --- MODALE DE GÉNÉRATION DE SOUS-GROUPES (DÉ) ---
  openGenerateGroupsModal(): void {
    // Utiliser this.brief et this.sourceGroupForBrief qui sont mis à jour par les observables
    if (!this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members || this.sourceGroupForBrief.members.length === 0) {
      alert("Ce brief n'est pas correctement lié à une promo (groupe source) avec des personnes pour la génération.");
      return;
    }
    this.generationCriteria = {
      peoplePerGroup: Math.min(3, this.sourceGroupForBrief.members.length),
      mixAncienDWWM: false, mixGenre: false, mixAisanceFrancais: false,
      mixNiveauTechnique: false, mixProfil: false, mixAge: false
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
    this.generateGroupsLogic(sourcePeople, this.generationCriteria);
    if (this.generatedWorkGroups.length > 0) {
      console.log(`${this.generatedWorkGroups.length} sous-groupes de travail ont été générés.`);
      this.updateCollaborationHistory(this.generatedWorkGroups);

    } else {
      this.generationError = "Aucun sous-groupe n'a pu être généré avec ces paramètres.";
    }
    this.closeGenerateGroupsModal();
  }

  private generateGroupsLogic(
  peopleInSourceGroup: Person[],
  criteria: typeof this.generationCriteria,
  numberOfWorkGroupsToSimulate?: number
): void {
  let availablePeople = JSON.parse(JSON.stringify(peopleInSourceGroup)) as Person[];
  // Mélanger les personnes disponibles initialement
  for (let i = availablePeople.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePeople[i], availablePeople[j]] = [availablePeople[j], availablePeople[i]];
  }

  const newWorkGroups: Group[] = [];
  let workGroupCounter = 1;
  const numGroupsToCreate = numberOfWorkGroupsToSimulate || Math.floor(availablePeople.length / criteria.peoplePerGroup);

  console.log("Début de generateGroupsLogic. Personnes disponibles:", availablePeople.length, "Groupes à créer:", numGroupsToCreate);

  for (let i = 0; i < numGroupsToCreate; i++) {
    if (availablePeople.length < criteria.peoplePerGroup && !(numberOfWorkGroupsToSimulate && availablePeople.length > 0)) {
      // Pas assez de monde pour un groupe complet (sauf si c'est le dernier simulé avec des restes)
      break;
    }

    const membersForNewWorkGroup: Person[] = [];
    let attemptsToFillGroup = 0; // Pour éviter une boucle infinie si les contraintes sont trop fortes

    while (membersForNewWorkGroup.length < criteria.peoplePerGroup && availablePeople.length > 0 && attemptsToFillGroup < peopleInSourceGroup.length * 2) {
      attemptsToFillGroup++;
      let bestCandidateIndex = -1;
      let minPastCollaborations = Infinity; // On cherche celui qui a le moins collaboré avec le groupe actuel

      // Parcourir les personnes disponibles pour trouver le meilleur candidat
      for (let k = 0; k < availablePeople.length; k++) {
        const candidate = availablePeople[k];
        let collaborationsWithCurrentGroup = 0;

        // Compter combien de fois ce candidat a collaboré avec les membres déjà dans le groupe en formation
        membersForNewWorkGroup.forEach(memberInGroup => {
          if (this.collaborationHistory.has(candidate.id.toString()) && this.collaborationHistory.get(candidate.id.toString())!.has(memberInGroup.id.toString())) {
            collaborationsWithCurrentGroup++;
          }
        });

        if (collaborationsWithCurrentGroup < minPastCollaborations) {
          minPastCollaborations = collaborationsWithCurrentGroup;
          bestCandidateIndex = k;
        }
        // Si on trouve qqn avec 0 collab, c'est l'idéal pour ce slot
        if (minPastCollaborations === 0) break;
      }

      if (bestCandidateIndex !== -1) {
        membersForNewWorkGroup.push(availablePeople.splice(bestCandidateIndex, 1)[0]);
      } else {
        // Si on ne trouve personne (cas étrange ou toutes les personnes restantes ont déjà collaboré au max)
        // On prend le premier disponible pour éviter de bloquer, mais ce n'est pas idéal.
        // Ou alors, on pourrait s'arrêter si on ne peut plus respecter la contrainte.
        // Pour l'instant, on force pour remplir le groupe.
        if (availablePeople.length > 0) {
           console.warn("generateGroupsLogic: Impossible de trouver un candidat optimal, ajout du premier disponible.");
           membersForNewWorkGroup.push(availablePeople.splice(0, 1)[0]);
        } else {
            break; // Plus personne de disponible
        }
      }
    }

    if (membersForNewWorkGroup.length > 0) {
         // Si on n'a pas pu remplir le groupe à la taille désirée mais qu'on a des membres (et qu'on est pas en simulation avec reste)
        // et que ce n'est pas le cas où on prend les restes pour un groupe simulé
        if (membersForNewWorkGroup.length < criteria.peoplePerGroup && !numberOfWorkGroupsToSimulate) {
            // Remettre ces personnes dans la liste des disponibles pour qu'elles soient potentiellement
            // réparties dans les groupes suivants si la taille n'est pas atteinte.
            // Ou décider de faire un groupe plus petit. Pour l'instant, on les remet.
            // availablePeople.push(...membersForNewWorkGroup);
            // console.log(`generateGroupsLogic: Groupe ${workGroupCounter} non complété (${membersForNewWorkGroup.length}/${criteria.peoplePerGroup}), membres remis disponibles.`);
            // continue; // On essaie de former le prochain groupe
            // Alternative: on crée le groupe plus petit quand même
             console.warn(`generateGroupsLogic: Groupe ${workGroupCounter} créé avec ${membersForNewWorkGroup.length} membres au lieu de ${criteria.peoplePerGroup}.`);
        }


      newWorkGroups.push({
        id: `brief-${this.brief!.id}-wg-${Date.now()}-${workGroupCounter}`,
        name: `Équipe ${workGroupCounter}${membersForNewWorkGroup.length < criteria.peoplePerGroup ? ' (partiel)' : ''}`,
        members: membersForNewWorkGroup,
      });
      workGroupCounter++;
    }
  }

  // Gestion des personnes restantes si on n'a pas fait de 'numberOfWorkGroupsToSimulate'
  // ou si même avec ça, il reste du monde et qu'on veut un groupe "reste"
  if (availablePeople.length > 0 && !numberOfWorkGroupsToSimulate) { // Modifié pour ne pas ajouter de groupe "reste" en simulation init
    console.log(`generateGroupsLogic: ${availablePeople.length} personnes restantes, création d'un groupe "Reste".`);
    newWorkGroups.push({
      id: `brief-${this.brief!.id}-wg-${Date.now()}-${workGroupCounter}`,
      name: `Équipe ${workGroupCounter} (Reste)`,
      members: availablePeople,
    });
  }

  this.generatedWorkGroups = newWorkGroups;
  console.log('Sous-groupes de travail générés (avec tentative d\'historique):', this.generatedWorkGroups);
  // IMPORTANT: Mettre à jour l'historique APRÈS que les groupes finaux sont décidés
  this.updateCollaborationHistory(this.generatedWorkGroups);
}

  // --- MODALE POUR AFFICHER LES MEMBRES D'UN SOUS-GROUPE DE TRAVAIL ---
  openWorkGroupMembersModal(workGroup: Group, event: MouseEvent): void {
    event.stopPropagation();
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
    this.editableWorkGroupData = JSON.parse(JSON.stringify(workGroup));
    this.editWorkGroupError = null;
    this.newPersonInput = '';
    this.isEditWorkGroupModalOpen = true;
  }

  closeEditWorkGroupModal(): void {
    this.isEditWorkGroupModalOpen = false;
    this.selectedWorkGroupToEdit = null;
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
      updatedGroups[groupIndex] = {
        ...updatedGroups[groupIndex],
        name: this.editableWorkGroupData.name,
        members: JSON.parse(JSON.stringify(this.editableWorkGroupData.members)),
        imageUrl: this.editableWorkGroupData.imageUrl
      };
      this.generatedWorkGroups = updatedGroups;
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
    // Utiliser this.sourceGroupForBrief qui est mis à jour par les observables
    if (!this.newPersonInput.trim() || !this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members) {
      this.editWorkGroupError = "Veuillez saisir une recherche et s'assurer que le brief a une promo source.";
      return;
    }
    const promoSourcePeople = this.sourceGroupForBrief.members;
    const searchTerm = this.newPersonInput.trim().toLowerCase();
    const personFound = promoSourcePeople.find(p =>
      p.nom.toLowerCase().includes(searchTerm) || (p.email && p.email.toLowerCase().includes(searchTerm))
    );
    if (personFound) {
      this.addPersonToEditableGroup(personFound);
      this.newPersonInput = '';
    } else {
      this.editWorkGroupError = `Personne "${this.newPersonInput}" non trouvée dans la promo "${this.sourceGroupForBrief.name}".`;
    }
  }

  getAvailablePeopleForEditingGroup(): Person[] {
    // Utiliser this.sourceGroupForBrief et this.editableWorkGroupData
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
      this.closeDeleteWorkGroupConfirmModal();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe(); // Se désabonner de tous les abonnements
  }



  private updateCollaborationHistory(workGroups: Group[]): void {
    workGroups.forEach(group => {
      const memberIds = group.members.map(m => m.id);
      for (let i = 0; i < memberIds.length; i++) {
        const person1Id = memberIds[i];
       if (!this.collaborationHistory.has(person1Id.toString())) { 
          this.collaborationHistory.set(person1Id.toString(), new Set<string>());
      }
        for (let j = i + 1; j < memberIds.length; j++) {
          const person2Id = memberIds[j];
          this.collaborationHistory.get(person1Id.toString())!.add(person2Id.toString());
          // Assurer la réciprocité
          if (!this.collaborationHistory.has(person2Id.toString())) {
            this.collaborationHistory.set(person2Id.toString(), new Set<string>());
          }
          this.collaborationHistory.get(person2Id.toString())!.add(person1Id.toString());
        }
      }
    });
    console.log('Historique des collaborations mis à jour:', this.collaborationHistory);
  }
}