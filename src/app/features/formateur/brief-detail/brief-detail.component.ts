// src/app/features/formateur/brief-detail/brief-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Pour la future modale de génération de dés

import { Brief } from '../../../core/services/models/brief.model';   // Ajuste le chemin
import { Group } from '../../../core/services/models/group.model';   // Ajuste le chemin
import { Person } from '../../../core/services/models/person.model'; // Ajuste le chemin

// --- DONNÉES SIMULÉES (À remplacer par des services plus tard) ---
const MOCK_PEOPLE: Person[] = [
  { id: 'p1', nom: 'Alice Lemaire', email: 'alice@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 3, profil: 'alaise', age: 28 },
  { id: 'p2', nom: 'Bob Martin', email: 'bob@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: false, niveauTechnique: 2, profil: 'reserve', age: 22 },
  { id: 'p3', nom: 'Charlie Durand', email: 'charlie@mail.com', genre: 'nsp', aisanceFrancais: 4, ancienDWWM: true, niveauTechnique: 4, profil: 'timide', age: 30 },
  { id: 'p4', nom: 'Diana Pires', email: 'diana@mail.com', genre: 'feminin', aisanceFrancais: 2, ancienDWWM: false, niveauTechnique: 1, profil: 'alaise', age: 25 },
  { id: 'p5', nom: 'Émile Petit', email: 'emile@mail.com', genre: 'masculin', aisanceFrancais: 3, ancienDWWM: true, niveauTechnique: 2, profil: 'reserve', age: 27 },
  { id: 'p6', nom: 'Fiona Guyot', email: 'fiona@mail.com', genre: 'feminin', aisanceFrancais: 4, ancienDWWM: false, niveauTechnique: 3, profil: 'alaise', age: 24 },
];

const MOCK_ALL_GROUPS: Group[] = [
  { id: 'grpPoneys', name: 'Les Poneys', members: [MOCK_PEOPLE[0], MOCK_PEOPLE[1]], imageUrl: 'assets/images/groupes/poneys.jpg' }, // Crée ces images
  { id: 'grpMarmottes', name: 'Les Marmottes', members: [MOCK_PEOPLE[2], MOCK_PEOPLE[3], MOCK_PEOPLE[4]], imageUrl: 'assets/images/groupes/marmottes.jpg' },
  { id: 'grpChatons', name: 'Les Chatons Agiles', members: [MOCK_PEOPLE[5], MOCK_PEOPLE[0]], imageUrl: 'assets/images/groupes/chatons.jpg' },
];

const MOCK_BRIEFS: Brief[] = [
  { id: 'brf1', name: 'Projet Portfolio V1', description: 'Création d\'un portfolio personnel interactif pour démontrer vos compétences acquises durant la formation.', imageUrl: 'assets/images/briefs/portfolio.jpg', peopleListId: 'promoDWWM2024', assignedGroupIds: ['grpA'] },
  { id: 'brf2', name: 'Application To-Do List', description: 'Développer une application web complète de gestion de tâches avec des fonctionnalités CRUD et une interface utilisateur intuitive.', imageUrl: 'assets/images/briefs/todo.jpg', peopleListId: 'promoCDA2024', assignedGroupIds: ['grpB', 'grpC'] },
  { id: 'brf3', name: 'Mini Clone Twitter', description: 'Reproduire les fonctionnalités de base de Twitter : publication de messages courts, suivi d\'utilisateurs, et affichage d\'un fil d\'actualité.',imageUrl: 'assets/images/briefs/twitter-clone.jpg', peopleListId: 'promoDWWM2024' /* Pas de groupes assignés pour celui-ci */ },
];
// --- FIN DES DONNÉES SIMULÉES ---

@Component({
  selector: 'app-brief-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './brief-detail.component.html',
  styleUrls: ['./brief-detail.component.css']
})


export class BriefDetailComponent implements OnInit {
  brief: Brief | undefined;
  associatedGroups: Group[] = []; // Les groupes spécifiquement liés à CE brief

  isGenerateGroupsModalOpen: boolean = false; // Pour la future modale du "dé"
   generationFormData = {
    numberOfGroups: 1, // D'après CdC: définir le nombre de groupes
    groupBaseName: '', // D'après CdC: donner un nom à chaque groupe (on fera un nom de base + numéro)
    // Critères du Cahier des Charges (section D Groupes)
    mixAncienDWWM: false,
    mixGenre: false,
    mixAisanceFrancais: false, // Si true, on essaiera d'avoir des niveaux différents
    mixNiveauTechnique: false, // Si true, on essaiera d'avoir des niveaux différents
    mixProfil: false,          // Si true, on essaiera d'avoir des profils différents
    mixAge: false              // Si true, on essaiera d'avoir des âges différents
    // Tu pourrais ajouter d'autres options comme:
    // avoidSamePreviousGroups: true, (CdC: prendre en compte les groupes déjà créés)
  };

  isMembersModalOpen: boolean = false; // Pour la modale des membres d'un groupe
  selectedGroupForMembers: Group | null = null; // Groupe dont on affiche les membres

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const briefIdFromRoute = this.route.snapshot.paramMap.get('id');
    if (briefIdFromRoute) {
      this.loadBriefAndAssociatedGroups(briefIdFromRoute);
    } else {
      console.error("ID du brief manquant dans l'URL");
      this.router.navigate(['/formateur/briefs']); // Rediriger si pas d'ID
    }
  }

  loadBriefAndAssociatedGroups(id: string): void {
    // 1. Trouver le brief
    this.brief = MOCK_BRIEFS.find(b => b.id === id);

    if (this.brief) {
      // 2. Si le brief est trouvé, trouver ses groupes associés
      if (this.brief.assignedGroupIds && this.brief.assignedGroupIds.length > 0) {
        this.associatedGroups = MOCK_ALL_GROUPS.filter(group =>
          this.brief!.assignedGroupIds!.includes(group.id) // '!' car on a vérifié this.brief
        );
      } else {
        this.associatedGroups = []; // Aucun groupe assigné
      }
    } else {
      console.error(`Brief avec l'ID ${id} non trouvé.`);
      this.router.navigate(['/formateur/briefs']); // Rediriger
    }
  }

    // --- MODALE POUR VOIR LES MEMBRES D'UN GROUPE ASSOCIÉ ---
  openMembersModal(group: Group, event: MouseEvent): void {
    event.stopPropagation(); // Empêche la navigation si la carte de groupe est aussi un lien
    this.selectedGroupForMembers = group;
    this.isMembersModalOpen = true;
    console.log('Ouverture modale membres pour:', group.name);
  }

  closeMembersModal(): void {
    this.isMembersModalOpen = false;
    this.selectedGroupForMembers = null;
  }


  // --- Méthodes pour la future modale de génération de groupes (dé) ---
  openGenerateGroupsModal(): void {
    if (!this.brief || !this.brief.peopleListId) {
        alert("Ce brief n'a pas de promo (liste de personnes) associée pour générer des groupes.");
        return;
    }
      this.generationFormData = {
      numberOfGroups: 2, // Par défaut 2 groupes
      groupBaseName: `Team ${this.brief.name || 'Projet'}`, // Nom de base suggéré
      mixAncienDWWM: false,
      mixGenre: false,
      mixAisanceFrancais: false,
      mixNiveauTechnique: false,
      mixProfil: false,
      mixAge: false
    };
    this.isGenerateGroupsModalOpen = true;
  }

  closeGenerateGroupsModal(): void {
    this.isGenerateGroupsModalOpen = false;
  }

  onGenerateGroupsSubmit(): void {
    // Logique de génération...
    console.log('Génération de groupes pour la promo:', this.brief?.peopleListId, 'avec critères:', this.generationFormData);
    this.closeGenerateGroupsModal();
  }
}