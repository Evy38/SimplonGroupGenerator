import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Nécessaire pour @if, @for, pipes (date)
import { RouterModule } from '@angular/router'; // Si tu prévois des liens vers un détail de brief plus tard

import { AuthService } from '../../../core/services/auth.service'; // Ajuste le chemin
import { BriefService } from '../../../core/services/brief.service'; // Ajuste le chemin
import { User } from '../../../core/services/models/user.model';         // Ajuste le chemin
import { Brief } from '../../../core/services/models/brief.model';       // Ajuste le chemin

@Component({
  selector: 'app-apprenant-brief-list',
  standalone: true,
  imports: [CommonModule, RouterModule], // Ajoute RouterModule si besoin
  templateUrl: './apprenant-brief-list.component.html',
  styleUrls: ['./apprenant-brief-list.component.css']
})
export class ApprenantBriefListComponent implements OnInit {
  currentUser: User | null = null;
  apprenantBriefs: Brief[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private briefService: BriefService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser && this.currentUser.role === 'apprenant' && this.currentUser.promoId) {
      this.loadBriefsForApprenant(this.currentUser.promoId);
    } else {
      this.isLoading = false;
      if (!this.currentUser?.promoId) {
        this.errorMessage = "Impossible de charger les briefs : informations de promotion manquantes pour cet utilisateur.";
        console.error("Utilisateur apprenant sans promoId:", this.currentUser);
      } else {
        this.errorMessage = "Accès non autorisé ou informations utilisateur incomplètes.";
      }
    }
  }

  loadBriefsForApprenant(promoId: string): void {
    this.isLoading = true;
    this.errorMessage = null;
     console.log('ApprenantBriefList: Chargement des briefs pour promoId:', promoId);
    this.briefService.briefs$.subscribe({
      next: (allBriefs: Brief[]) => {
         console.log('ApprenantBriefList: Tous les briefs reçus du service:', allBriefs);
        this.apprenantBriefs = allBriefs.filter((brief: Brief) => brief.promoId === promoId);
        console.log('ApprenantBriefList: Briefs filtrés pour l\'apprenant:', this.apprenantBriefs);
        if (this.apprenantBriefs.length === 0) {
          // Tu peux choisir de mettre un message spécifique ou de laisser le template gérer "Aucun brief trouvé"
          console.log(`Aucun brief trouvé pour la promoId: ${promoId}`);
        }
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error("Erreur lors du chargement des briefs:", err);
        this.errorMessage = "Une erreur est survenue lors du chargement des briefs.";
        this.isLoading = false;
      }
    });
  }
}