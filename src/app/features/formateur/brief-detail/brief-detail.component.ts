// src/app/features/formateur/brief-detail/brief-detail.component.ts
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subscription, switchMap, tap, filter, Observable, of, combineLatest, map } from 'rxjs';

import { Brief } from '../../../core/services/models/brief.model';
import { Group } from '../../../core/services/models/group.model';
import { Person } from '../../../core/services/models/person.model';

import { PromoService } from '../../../core/services/promo.service';
import { BriefService } from '../../../core/services/brief.service';

import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-brief-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    DragDropModule
  ],
  templateUrl: './brief-detail.component.html',
  styleUrls: ['./brief-detail.component.css']
})
export class BriefDetailComponent implements OnInit, OnDestroy {
  brief$: Observable<Brief | undefined>;
  sourceGroupForBrief$: Observable<Group | undefined>;
  viewData$: Observable<{ brief: Brief; sourceGroup: Group } | undefined>;

  brief: Brief | undefined;
  sourceGroupForBrief: Group | undefined;

  generatedWorkGroups: Group[] = [];
  unassignedMembersFromBrief: Person[] = [];

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

  hasUnsavedWorkGroupChanges: boolean = false;

  private collaborationHistory: Map<string, Set<string>> = new Map();
  private subscriptions: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private promoService: PromoService,
    private briefService: BriefService,
    private cdr: ChangeDetectorRef
  ) {
    const briefIdFromRoute$ = this.route.paramMap.pipe(
      map(params => params.get('id')),
      filter((id): id is string => id !== null && id !== undefined)
    );

    this.brief$ = briefIdFromRoute$.pipe(
      switchMap(briefId => this.briefService.getBriefById(briefId)),
      tap(loadedBrief => {
        if (!loadedBrief) {
          console.error('BriefDetail: Brief non trouvé. Redirection...');
          this.router.navigate(['/formateur/briefs']);
        }
      })
    );

    this.sourceGroupForBrief$ = this.brief$.pipe(
      filter((b): b is Brief => !!b && b.sourceGroupId !== null && b.sourceGroupId !== undefined),
      switchMap(b => this.promoService.getPromoById(b.sourceGroupId!.toString())),
      tap(promo => {
        if (!promo) {
          console.warn('BriefDetail: Promo source non trouvée pour le brief.');
        }
      })
    );

    this.viewData$ = combineLatest([this.brief$, this.sourceGroupForBrief$]).pipe(
      map(([loadedBrief, sourcePromo]) => {
        if (loadedBrief) {
          return { brief: loadedBrief, sourceGroup: sourcePromo || this.createEmptyPromoPlaceholder(loadedBrief.sourceGroupId) };
        }
        return undefined;
      }),
      tap(data => {
        if (data && data.brief) {
          this.brief = { ...data.brief };
          this.sourceGroupForBrief = data.sourceGroup ? { ...data.sourceGroup } : undefined;
          console.log('BriefDetail: viewData$ émis. Brief:', this.brief, 'Promo Source:', this.sourceGroupForBrief);

          if (this.brief.groups && this.brief.groups.length > 0) {
            this.generatedWorkGroups = JSON.parse(JSON.stringify(this.brief.groups));
            console.log('Groupes de travail chargés depuis le brief existant:', this.generatedWorkGroups);
          } else {
             this.simulateInitialGroupGeneration();
          }
          if (this.sourceGroupForBrief && this.sourceGroupForBrief.members) {
            this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
          } else {
             this.unassignedMembersFromBrief = [];
          }
           this.hasUnsavedWorkGroupChanges = false;
        } else if (this.brief && !this.sourceGroupForBrief) {
            console.warn("BriefDetail: Brief chargé mais promo source non disponible.");
            this.generatedWorkGroups = this.brief.groups ? JSON.parse(JSON.stringify(this.brief.groups)) : [];
            this.unassignedMembersFromBrief = [];
            this.hasUnsavedWorkGroupChanges = false;
        }
      })
    );
  }

  private createEmptyPromoPlaceholder(id?: string|number|null): Group {
    return { id: id?.toString() || 'unknown-promo-id', name: 'Promo source non trouvée', members: [] };
  }

  ngOnInit(): void {
    this.subscriptions.add(this.viewData$.subscribe());
  }

  simulateInitialGroupGeneration(): void {
    if (this.brief && this.sourceGroupForBrief && this.sourceGroupForBrief.members && this.sourceGroupForBrief.members.length > 0) {
      if (this.generatedWorkGroups && this.generatedWorkGroups.length > 0) {
        return;
      }
      const criteriaForSample = {
        peoplePerGroup: Math.min(2, this.sourceGroupForBrief.members.length),
        mixAncienDWWM: false, mixGenre: false, mixAisanceFrancais: false,
        mixNiveauTechnique: false, mixProfil: false, mixAge: false
      };
      if (this.sourceGroupForBrief.members.length >= criteriaForSample.peoplePerGroup && criteriaForSample.peoplePerGroup > 0) {
        this.generateGroupsLogic(this.sourceGroupForBrief.members, criteriaForSample, 2);
      } else { this.generatedWorkGroups = []; }
    } else { this.generatedWorkGroups = []; }
  }

  onGenerateGroupsSubmit(): void {
    this.generationError = null;
    if (!this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members || this.sourceGroupForBrief.members.length === 0) {
      this.generationError = "Données du brief ou de la promo source (avec membres) manquantes."; return;
    }
    const sourcePeople = this.sourceGroupForBrief.members;
    if (this.generationCriteria.peoplePerGroup <= 0 || sourcePeople.length < this.generationCriteria.peoplePerGroup) {
      this.generationError = `Vérifiez le nombre de personnes par sous-groupe (min 1, max ${sourcePeople.length} pour cette promo).`; return;
    }
    this.generateGroupsLogic(sourcePeople, this.generationCriteria);
    if (this.sourceGroupForBrief?.members) {
        this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
    }
    this.hasUnsavedWorkGroupChanges = true;
    this.closeGenerateGroupsModal();
  }

  private generateGroupsLogic(
    peopleInSourceGroup: Person[],
    criteria: typeof this.generationCriteria,
    numberOfWorkGroupsToSimulate?: number
  ): void {
    let availablePeople = JSON.parse(JSON.stringify(peopleInSourceGroup)) as Person[];
    for (let i = availablePeople.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availablePeople[i], availablePeople[j]] = [availablePeople[j], availablePeople[i]];
    }
    const newWorkGroups: Group[] = [];
    let workGroupCounter = 1;
    const numTargetGroups = numberOfWorkGroupsToSimulate || Math.floor(availablePeople.length / criteria.peoplePerGroup);

    for (let i = 0; i < numTargetGroups; i++) {
      if (availablePeople.length === 0) break;
      const groupSize = (i === numTargetGroups - 1 && numberOfWorkGroupsToSimulate) ?
                        Math.min(criteria.peoplePerGroup, availablePeople.length) :
                        (numberOfWorkGroupsToSimulate ? criteria.peoplePerGroup :
                        Math.min(criteria.peoplePerGroup, availablePeople.length));
      if (availablePeople.length < groupSize && !(i === numTargetGroups - 1 && numberOfWorkGroupsToSimulate)) {
         if (availablePeople.length > 0 && !numberOfWorkGroupsToSimulate) {} else { break; }
      }
      const membersForNewWorkGroup: Person[] = [];
      let attemptsToFillGroup = 0;
      while (membersForNewWorkGroup.length < groupSize && availablePeople.length > 0 && attemptsToFillGroup < peopleInSourceGroup.length * 2) {
        attemptsToFillGroup++;
        let bestCandidateIndex = -1;
        let minPastCollaborations = Infinity;
        for (let k = 0; k < availablePeople.length; k++) {
          const candidate = availablePeople[k];
          let collaborationsWithCurrentGroup = 0;
          membersForNewWorkGroup.forEach(memberInGroup => {
            if (this.collaborationHistory.has(candidate.id.toString()) && this.collaborationHistory.get(candidate.id.toString())!.has(memberInGroup.id.toString())) {
              collaborationsWithCurrentGroup++;
            }
          });
          if (collaborationsWithCurrentGroup < minPastCollaborations) {
            minPastCollaborations = collaborationsWithCurrentGroup;
            bestCandidateIndex = k;
          }
          if (minPastCollaborations === 0) break;
        }
        if (bestCandidateIndex !== -1) {
          membersForNewWorkGroup.push(availablePeople.splice(bestCandidateIndex, 1)[0]);
        } else { if (availablePeople.length > 0) { membersForNewWorkGroup.push(availablePeople.splice(0, 1)[0]); } else { break; } }
      }
      if (membersForNewWorkGroup.length > 0) {
        newWorkGroups.push({
          id: `brief-${this.brief?.id || 'unknown'}-wg-${Date.now()}-${workGroupCounter}`,
          name: `Équipe ${workGroupCounter}`,
          members: membersForNewWorkGroup,
        });
        workGroupCounter++;
      }
    }
    if (availablePeople.length > 0 && !numberOfWorkGroupsToSimulate) {
      newWorkGroups.push({
        id: `brief-${this.brief?.id || 'unknown'}-wg-${Date.now()}-${workGroupCounter}`,
        name: `Équipe ${workGroupCounter} (Reste)`,
        members: availablePeople,
      });
    }
    this.generatedWorkGroups = newWorkGroups;
    this.updateCollaborationHistory(this.generatedWorkGroups);
  }

  initializeUnassignedMembers(allPromoMembers: Person[] | undefined): void {
    if (!allPromoMembers || allPromoMembers.length === 0) {
      this.unassignedMembersFromBrief = [];
      this.cdr.detectChanges();
      return;
    }
    const assignedMemberIds = new Set<string>();
    this.generatedWorkGroups.forEach(group => {
      group.members.forEach(member => assignedMemberIds.add(member.id));
    });
    // .filter() retourne déjà une nouvelle référence de tableau
    this.unassignedMembersFromBrief = allPromoMembers.filter(
      person => !assignedMemberIds.has(person.id)
    );
    this.cdr.detectChanges();
    console.log('Membres non assignés initialisés/mis à jour:', this.unassignedMembersFromBrief.length);
  }

  dropMember(event: CdkDragDrop<Person[], any, Person>, targetGroupIdString: string | null | undefined): void {
    const movedPerson: Person = event.item.data;
    console.groupCollapsed(`--- Drop Event pour ${movedPerson.nom} ---`);
    // console.log('Previous Container ID:', event.previousContainer.id, 'Data:', JSON.parse(JSON.stringify(event.previousContainer.data)));
    // console.log('Current Container ID:', event.container.id, 'Data AVANT:', JSON.parse(JSON.stringify(event.container.data)));
    // console.log('Target Group ID (param):', targetGroupIdString);

    if (!event.container.data || !event.previousContainer.data) {
      console.warn('DragDrop: Données de conteneur invalides.');
      console.groupEnd();
      return;
    }

    if (event.previousContainer === event.container) {
      // console.log('Action: Réordonnancement.');
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // console.log('Action: Transfert.');
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    }

    this.generatedWorkGroups = this.generatedWorkGroups.map(g => {
      if (g.members === event.previousContainer.data || g.members === event.container.data) {
        return { ...g, members: [...g.members] };
      }
      return g;
    });
    this.generatedWorkGroups = [...this.generatedWorkGroups];

    if (this.sourceGroupForBrief && this.sourceGroupForBrief.members) {
      this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
    }

    this.hasUnsavedWorkGroupChanges = true;
    this.cdr.detectChanges();
    // console.log('GeneratedWorkGroups FINAL après drop:', JSON.parse(JSON.stringify(this.generatedWorkGroups)));
    // console.log('UnassignedMembers FINAL après drop:', JSON.parse(JSON.stringify(this.unassignedMembersFromBrief)));
    console.groupEnd();
  }

  saveGeneratedWorkGroups(): void {
    if (!this.brief) {
      console.error("Erreur : Brief non chargé."); alert("Erreur : Brief non chargé."); return;
    }
    if (!this.hasUnsavedWorkGroupChanges) {
        console.log("Aucun changement non sauvegardé détecté.");
        alert("Aucun changement à sauvegarder.");
        return;
    }
    const briefToUpdate: Brief = {
      ...this.brief,
      groups: JSON.parse(JSON.stringify(this.generatedWorkGroups))
    };
    console.log('BriefDetail - Données envoyées à updateBrief:', briefToUpdate);
   

    this.subscriptions.add(
      this.briefService.updateBrief(briefToUpdate).subscribe({
        next: (savedBrief?: Brief) => {
          if (savedBrief) {
            this.brief = { ...savedBrief };
            this.generatedWorkGroups = savedBrief.groups ? JSON.parse(JSON.stringify(savedBrief.groups)) : [];
            if (this.sourceGroupForBrief?.members) {
                 this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
            }
            this.hasUnsavedWorkGroupChanges = false;
            alert('Groupes sauvegardés avec succès !');
            this.cdr.detectChanges();
          } else {
            alert('Erreur lors de la sauvegarde : Le brief retourné est indéfini.');
          }
        },
        error: (err: any) => {
          console.error('Erreur lors de la sauvegarde des sous-groupes:', err);
          alert('Une erreur est survenue lors de la sauvegarde des groupes.');
        }
      })
    );
  }

  // --- MODALES ---
  openGenerateGroupsModal(): void {
    if (!this.brief || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members || this.sourceGroupForBrief.members.length === 0) { alert("Promo source ou membres manquants."); return; }
    this.generationCriteria.peoplePerGroup = Math.min(2, this.sourceGroupForBrief.members.length); this.generationError = null; this.isGenerateGroupsModalOpen = true;
  }
  closeGenerateGroupsModal(): void { this.isGenerateGroupsModalOpen = false; }

  openWorkGroupMembersModal(workGroup: Group, event: MouseEvent): void { event.stopPropagation(); this.selectedWorkGroupForMembers = workGroup; this.isMembersModalOpen = true; }
  closeWorkGroupMembersModal(): void { this.isMembersModalOpen = false; this.selectedWorkGroupForMembers = null; }

  openEditWorkGroupModal(workGroup: Group, event?: MouseEvent): void {
    event?.stopPropagation(); this.selectedWorkGroupToEdit = workGroup;
    this.editableWorkGroupData = JSON.parse(JSON.stringify(workGroup));
    this.editWorkGroupError = null; this.newPersonInput = ''; this.isEditWorkGroupModalOpen = true;
  }
  closeEditWorkGroupModal(): void { this.isEditWorkGroupModalOpen = false; this.selectedWorkGroupToEdit = null; }

  onSaveWorkGroupChanges(): void {
    if (!this.editableWorkGroupData || !this.selectedWorkGroupToEdit) { this.editWorkGroupError = "Données invalides."; return; }
    if (!this.editableWorkGroupData.name.trim()) { this.editWorkGroupError = "Nom requis."; return; }
    const groupIndex = this.generatedWorkGroups.findIndex(g => g.id === this.selectedWorkGroupToEdit!.id);
    if (groupIndex > -1) {
      const updatedGroups = [...this.generatedWorkGroups];
      updatedGroups[groupIndex] = JSON.parse(JSON.stringify(this.editableWorkGroupData));
      this.generatedWorkGroups = updatedGroups;
      this.hasUnsavedWorkGroupChanges = true;
      if (this.sourceGroupForBrief?.members) {
        this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
      }
    } else { this.editWorkGroupError = "Groupe non trouvé."; }
    this.closeEditWorkGroupModal();
  }

  removeMemberFromEditableGroup(memberToRemove: Person): void {
    if (this.editableWorkGroupData) { this.editableWorkGroupData.members = this.editableWorkGroupData.members.filter(m => m.id !== memberToRemove.id); }
  }
  addPersonToEditableGroup(personToAdd: Person): void {
    if (this.editableWorkGroupData && !this.editableWorkGroupData.members.find(m => m.id === personToAdd.id)) {
      this.editableWorkGroupData.members = [...this.editableWorkGroupData.members, JSON.parse(JSON.stringify(personToAdd))];
    }
  }
  addPersonFromInput(): void {
    if (!this.newPersonInput.trim() || !this.sourceGroupForBrief || !this.sourceGroupForBrief.members) { this.editWorkGroupError = "Sélectionnez une promo et saisissez un nom/email."; return; }
    const promoSourcePeople = this.sourceGroupForBrief.members;
    const searchTerm = this.newPersonInput.trim().toLowerCase();
    const personFound = promoSourcePeople.find(p => p.nom.toLowerCase().includes(searchTerm) || (p.email && p.email.toLowerCase().includes(searchTerm)));
    if (personFound) { this.addPersonToEditableGroup(personFound); this.newPersonInput = ''; this.editWorkGroupError = null; }
    else { this.editWorkGroupError = `Personne "${this.newPersonInput}" non trouvée.`; }
  }
  getAvailablePeopleForEditingGroup(): Person[] {
    if (!this.sourceGroupForBrief || !this.sourceGroupForBrief.members || !this.editableWorkGroupData) return [];
    const currentMemberIds = new Set(this.editableWorkGroupData.members.map(m => m.id));
    return this.sourceGroupForBrief.members.filter(p => !currentMemberIds.has(p.id));
  }

  openDeleteWorkGroupConfirmModal(workGroup: Group, event?: MouseEvent): void {
    event?.stopPropagation(); this.workGroupToDelete = workGroup; this.isDeleteWorkGroupConfirmModalOpen = true;
  }
  closeDeleteWorkGroupConfirmModal(): void { this.isDeleteWorkGroupConfirmModalOpen = false; this.workGroupToDelete = null; }
  confirmDeleteWorkGroup(): void {
    if (this.workGroupToDelete) {
      this.generatedWorkGroups = this.generatedWorkGroups.filter(g => g.id !== this.workGroupToDelete!.id);
      this.hasUnsavedWorkGroupChanges = true;
      if (this.sourceGroupForBrief?.members) {
        this.initializeUnassignedMembers(this.sourceGroupForBrief.members);
      }
      this.closeDeleteWorkGroupConfirmModal();
    }
  }

  private updateCollaborationHistory(workGroups: Group[]): void {
     workGroups.forEach(group => {
      const memberIds = group.members.map(m => m.id.toString());
      for (let i = 0; i < memberIds.length; i++) {
        const person1Id = memberIds[i];
       if (!this.collaborationHistory.has(person1Id)) { this.collaborationHistory.set(person1Id, new Set<string>()); }
        for (let j = i + 1; j < memberIds.length; j++) {
          const person2Id = memberIds[j];
          this.collaborationHistory.get(person1Id)!.add(person2Id);
          if (!this.collaborationHistory.has(person2Id)) { this.collaborationHistory.set(person2Id, new Set<string>()); }
          this.collaborationHistory.get(person2Id)!.add(person1Id);
        }
      }
    });
    // console.log('Historique des collaborations mis à jour:', this.collaborationHistory);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}