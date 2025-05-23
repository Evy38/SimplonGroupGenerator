import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // Pour routerLink
import { FormsModule } from '@angular/forms'; // Pour la modale de création
import { Group } from '../../../core/services/models/group.model'; // Ajuste le chemin
import { Person } from '../../../core/services/models/person.model'; // Ajuste le chemin

@Component({
  selector: 'app-brief-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})

export class GroupListComponent implements OnInit {
  groups: Group[] = [];
  isCreateGroupModalOpen: boolean = false;

  newGroupData = {
    numberOfGroups: 1,
    groupNames: [''],
    imageUrl: '' // NOUVEAU: Ajout pour l'URL de l'image du/des groupe(s)
  };

  availablePeople: Person[] = [
    { id: 101, nom: 'Alice Dupont', email: 'alice@example.com', role: 'apprenant' },
    { id: 102, nom: 'Bob Martin', email: 'bob@example.com', role: 'apprenant' },
    { id: 103, nom: 'Charlie Durand', email: 'charlie@example.com', role: 'apprenant' },
    { id: 104, nom: 'Diana Moreau', email: 'diana@example.com', role: 'apprenant' },
  ];
  selectedPeopleForNewGroup: Person[] = [];

  registerError: string | null = null;
  registerSuccess: string | null = null;

  isMembersModalOpen: boolean = false;
  selectedGroupForMembers: Group | null = null;

  isEditMode: boolean = false;
  groupToEdit: Group | null = null;

  isConfirmDeleteModalOpen: boolean = false;
  groupToDelete: Group | null = null;

  newPersonInput: string = '';

  // currentFormData n'est plus utilisé si on adapte newGroupData
  // currentFormData = {
  //   name: '',
  //   imageUrl: '',
  // };

  constructor() { }

  ngOnInit(): void {
    this.loadGroups();
  }

  loadGroups(): void {
    const person1: Person = { id: 1, nom: 'Jean Apprenant', email: 'jean@example.com' }; // Ajouté email pour cohérence
    const person2: Person = { id: 2, nom: 'Marie Étudiante', email: 'marie@example.com' };
    const person3: Person = { id: 3, nom: 'Pierre Dev', email: 'pierre@example.com' };

    this.groups = [
      { id: 'grp1', name: 'Les Marmottes', imageUrl: 'assets/marmottes.png', members: [person1, person2] },
      { id: 'grp2', name: 'Les Poneys', imageUrl: 'assets/poneys.png', members: [person3, person1] },
      { id: 'grp3', name: 'Les Chatons', imageUrl: 'assets/chatons.png', members: [person2, person3, person1] },
    ];
    this.updateGroupNamesArray();
  }

  openCreateGroupModal(): void {
    this.isEditMode = false;
    this.groupToEdit = null;
    this.isCreateGroupModalOpen = true;
    // MODIFIÉ: réinitialiser newGroupData avec imageUrl
    this.newGroupData = { numberOfGroups: 1, groupNames: [''], imageUrl: '' };
    this.updateGroupNamesArray();
    this.selectedPeopleForNewGroup = [];
    this.newPersonInput = ''; 
    this.registerError = null;
    this.registerSuccess = null;
  }

  closeCreateGroupModal(): void {
    this.isCreateGroupModalOpen = false;
    this.isEditMode = false;
    this.groupToEdit = null;
    // Optionnel: réinitialiser newGroupData ici aussi
    // this.newGroupData = { numberOfGroups: 1, groupNames: [''], imageUrl: '' };
    // this.selectedPeopleForNewGroup = [];
  }

  updateGroupNamesArray(): void {
    const num = Number(this.newGroupData.numberOfGroups) || 1;
    const currentNames = this.newGroupData.groupNames || [];
    this.newGroupData.groupNames = Array(num).fill('').map((_, i) => currentNames[i] || `Groupe ${i + 1}`);
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  togglePersonSelection(person: Person): void {
    const index = this.selectedPeopleForNewGroup.findIndex(p => p.id === person.id);
    if (index > -1) {
      this.selectedPeopleForNewGroup.splice(index, 1);
    } else {
      this.selectedPeopleForNewGroup.push(person);
    }
  }

  isPersonSelected(person: Person): boolean {
    return this.selectedPeopleForNewGroup.some(p => p.id === person.id);
  }

  // NOUVELLE MÉTHODE: Pour supprimer une personne de la sélection dans la modale
  removePersonFromCurrentGroupSelection(personToRemove: Person): void {
    this.selectedPeopleForNewGroup = this.selectedPeopleForNewGroup.filter(
      p => p.id !== personToRemove.id
    );
  }

   addPersonFromInput(): void {
    const searchTerm = this.newPersonInput.trim().toLowerCase();
    if (!searchTerm) return;

    let foundPerson = this.availablePeople.find(
      p => p.nom.toLowerCase().includes(searchTerm) || (p.email && p.email.toLowerCase().includes(searchTerm))
    );

    if (foundPerson) {
      if (!this.isPersonSelected(foundPerson)) {
        this.selectedPeopleForNewGroup.push(foundPerson);
      }
    } else {
      const isEmail = searchTerm.includes('@');
      const newPersonToAdd: Person = {
        id: `new-${Date.now()}`, // ID unique simple
        nom: isEmail ? `Invité (${searchTerm.split('@')[0]})` : searchTerm,
        email: isEmail ? searchTerm : undefined,
        // Les autres champs de Person seront undefined pour cette personne "invitée"
        // Tu devras ajuster ton interface Person si certains champs sont obligatoires et non optionnels
        genre: undefined,
        aisanceFrancais: undefined,
        ancienDWWM: undefined,
        niveauTechnique: undefined,
        profil: undefined,
        age: undefined,
        role: 'apprenant' // Ou undefined, selon ton modèle Person
      };
      if (!this.selectedPeopleForNewGroup.some(p => (p.email && p.email === newPersonToAdd.email && p.email !== undefined) || p.nom === newPersonToAdd.nom)) {
        this.selectedPeopleForNewGroup.push(newPersonToAdd);
      }
    }
    this.newPersonInput = ''; // Vider le champ
  }

  onCreateGroupSubmit(): void { // MODIFIÉ: Gère création ET édition
    this.registerError = null;
    this.registerSuccess = null;

    if (this.isEditMode && this.groupToEdit) {
      // --- LOGIQUE DE MODIFICATION ---
      // En mode édition, on modifie le nom du premier (et unique) groupe dans groupNames
      // et l'imageUrl de newGroupData. Les membres sont dans selectedPeopleForNewGroup.
      if (!this.newGroupData.groupNames[0] || this.newGroupData.groupNames[0].trim() === '') {
        this.registerError = "Le nom du groupe est obligatoire.";
        return;
      }

      const groupIndex = this.groups.findIndex(g => g.id === this.groupToEdit!.id);
      if (groupIndex > -1) {
        this.groups[groupIndex].name = this.newGroupData.groupNames[0];
        this.groups[groupIndex].imageUrl = this.newGroupData.imageUrl || undefined; // Utiliser undefined si vide
        this.groups[groupIndex].members = [...this.selectedPeopleForNewGroup]; // Mettre à jour les membres

        this.registerSuccess = `Groupe '${this.groups[groupIndex].name}' modifié avec succès.`;
        console.log('Groupe modifié:', this.groups[groupIndex]);
      } else {
        this.registerError = "Erreur : Groupe à modifier non trouvé.";
      }

    } else {
      // --- LOGIQUE DE CRÉATION (comme avant, mais en utilisant newGroupData.imageUrl) ---
      let allNamesValid = true;
      this.newGroupData.groupNames.forEach(name => {
        if (name.trim() === '') {
          allNamesValid = false;
        }
      });

      if (!allNamesValid || this.newGroupData.groupNames.length === 0) {
        this.registerError = "Veuillez donner un nom à chaque groupe.";
        return;
      }
      // La vérification de selectedPeopleForNewGroup peut rester si tu la veux pour la création multiple
      if (this.selectedPeopleForNewGroup.length === 0 && this.newGroupData.groupNames.length > 0) {
        this.registerError = "Veuillez sélectionner au moins une personne pour les groupes.";
        return;
      }

      let createdCount = 0;
      this.newGroupData.groupNames.forEach((groupName, index) => {
        const newId = `grp${Date.now()}${index}`;
        const newGroup: Group = {
          id: newId,
          name: groupName,
          imageUrl: this.newGroupData.imageUrl || `https://via.placeholder.com/300x200/9E9E9E/FFFFFF?Text=${encodeURIComponent(groupName)}`, // Image pour CE groupe
          members: [...this.selectedPeopleForNewGroup] // Les mêmes personnes pour tous les groupes créés en une fois
        };
        this.groups.push(newGroup);
        createdCount++;
      });
      if (createdCount > 0) {
        this.registerSuccess = `${createdCount} groupe(s) créé(s) avec succès !`;
      } else {
        this.registerError = "Aucun groupe n'a été créé.";
      }
    }

    setTimeout(() => {
      this.closeCreateGroupModal();
      this.registerSuccess = null;
      this.registerError = null;
    }, 2000);
  }

  openMembersModal(group: Group): void {
    this.selectedGroupForMembers = group;
    this.isMembersModalOpen = true;
  }

  closeMembersModal(): void {
    this.isMembersModalOpen = false;
    this.selectedGroupForMembers = null;
  }

  openEditGroupModal(group: Group): void { // MODIFIÉ
    this.isEditMode = true;
    this.groupToEdit = { ...group, members: [...group.members] }; // Copie pour édition
    this.isCreateGroupModalOpen = true;

    // Pré-remplir newGroupData pour l'édition (on modifie UN groupe à la fois)
    this.newGroupData = {
      numberOfGroups: 1, // En mode édition, on modifie un seul groupe
      groupNames: [group.name], // Nom du groupe actuel
      imageUrl: group.imageUrl || '' // URL de l'image actuelle
    };
    this.selectedPeopleForNewGroup = [...group.members]; // Pré-sélectionner les membres actuels

    this.newPersonInput = '';
    this.registerError = null;
    this.registerSuccess = null;
  }

  confirmDeleteGroup(group: Group): void {
    this.groupToDelete = group;
    this.isConfirmDeleteModalOpen = true;
  }

  closeConfirmDeleteModal(): void {
    this.isConfirmDeleteModalOpen = false;
    this.groupToDelete = null;
  }

  deleteGroup(): void {
    if (this.groupToDelete) {
      this.groups = this.groups.filter(g => g.id !== this.groupToDelete!.id);
      this.closeConfirmDeleteModal();
    }
  }
}