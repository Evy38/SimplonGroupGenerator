// src/app/features/apprenant/apprenant-groupe-list/apprenant-groupe-list.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from '../../../core/services/auth.service';
import { BriefService } from '../../../core/services/brief.service';
import { User } from '../../../core/services/models/user.model';
import { Person } from '../../../core/services/models/person.model';

// Interface pour structurer les données à afficher dans ce composant
export interface ApprenantGroupDisplayInfo {
  briefId: string;
  briefTitle: string;
  briefImageUrl?: string;
  groupId: string | number; // L'ID du sous-groupe
  groupName: string;
  groupMembers: Person[]; // Coéquipiers (sans l'apprenant actuel)
}

@Component({
  selector: 'app-apprenant-groupe-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './apprenant-groupe-list.component.html',
  styleUrls: ['./apprenant-groupe-list.component.css']
})
export class ApprenantGroupeListComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private briefService = inject(BriefService);
  private subscriptions = new Subscription();

  currentUser: User | null = null;
  displayedGroupsInfo: ApprenantGroupDisplayInfo[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser && this.currentUser.role === 'apprenant' && this.currentUser.promoId) {
      console.log(`ApprenantGroupeList: Initialisation pour l'utilisateur ID ${this.currentUser.id} et promoId ${this.currentUser.promoId}`);
      this.loadUserGroups(this.currentUser.id, this.currentUser.promoId);
    } else {
      console.error("ApprenantGroupeList: currentUser, rôle, ou promoId manquant.", this.currentUser);
      this.errorMessage = "Informations utilisateur ou de promotion manquantes pour afficher vos groupes.";
      this.isLoading = false;
    }
  }

  loadUserGroups(userId: string, userPromoId: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`ApprenantGroupeList: Appel de loadUserGroups avec userId: ${userId}, userPromoId: ${userPromoId}`);

    const briefsSub = this.briefService.getBriefsByPromoId(userPromoId).pipe(
      map(briefsFromPromo => {
        const groupsList: ApprenantGroupDisplayInfo[] = [];
        console.log(`ApprenantGroupeList - Briefs reçus pour la promo '${userPromoId}':`, JSON.parse(JSON.stringify(briefsFromPromo))); // Copie profonde pour le log

        briefsFromPromo.forEach(brief => {
          console.log(`ApprenantGroupeList - Traitement du brief: "${brief.title}" (ID: ${brief.id})`);
          // Vérifier si le brief a la propriété 'groups' et qu'elle n'est pas vide
          if (brief.groups && Array.isArray(brief.groups) && brief.groups.length > 0) {
            console.log(`ApprenantGroupeList - Brief "${brief.title}" a ${brief.groups.length} sous-groupe(s).`);
            brief.groups.forEach(workGroup => {
              console.log(`ApprenantGroupeList --- Vérification du sous-groupe "${workGroup.name}" (ID: ${workGroup.id}) avec ${workGroup.members.length} membre(s)`);
              // Vérifier si l'apprenant actuel est membre de ce sous-groupe
              const isMember = workGroup.members.some(member => member.id === userId);
              console.log(`ApprenantGroupeList --- L'utilisateur ${userId} est membre de "${workGroup.name}" ? ${isMember}`);
              if (isMember) {
                groupsList.push({
                  briefId: brief.id,
                  briefTitle: brief.title,
                  briefImageUrl: brief.imageUrl,
                  groupId: workGroup.id,
                  groupName: workGroup.name,
                  groupMembers: workGroup.members.filter(member => member.id !== userId)
                });
              }
            });
          } else {
            console.log(`ApprenantGroupeList - Le brief "${brief.title}" (ID: ${brief.id}) n'a pas de propriété 'groups' valide ou elle est vide.`);
          }
        });
        return groupsList;
      })
    ).subscribe({
      next: (displayList) => {
        this.displayedGroupsInfo = displayList;
        console.log('ApprenantGroupeList - Liste finale pour affichage (displayedGroupsInfo):', this.displayedGroupsInfo);
        if (this.displayedGroupsInfo.length === 0) {
          console.log("ApprenantGroupeList - Aucun groupe de travail trouvé pour cet apprenant après filtrage complet.");
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error("ApprenantGroupeList - Erreur lors du chargement des groupes de l'apprenant:", err);
        this.errorMessage = "Une erreur est survenue lors de la récupération de vos groupes.";
        this.isLoading = false;
      }
    });
    this.subscriptions.add(briefsSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}