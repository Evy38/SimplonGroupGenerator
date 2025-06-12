// src/app/features/apprenant/apprenant-brief-list/apprenant-brief-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../../core/services/auth.service';
import { BriefService } from '../../../core/services/brief.service';
import { PromoService } from '../../../core/services/promo.service';
import { User } from '../../../core/services/models/user.model';
import { Brief } from '../../../core/services/models/brief.model'; // Assure-toi que ce modèle contient tous les champs que tu veux afficher
import { Group as Promo } from '../../../core/services/models/group.model';


@Component({
  selector: 'app-apprenant-brief-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './apprenant-brief-list.component.html',
  styleUrls: ['./apprenant-brief-list.component.css']
})
export class ApprenantBriefListComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  apprenantBriefs: Brief[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  private promosMap: Map<string, string> = new Map();
  private subscriptions: Subscription = new Subscription();

  // --- NOUVELLES PROPRIÉTÉS POUR LA MODALE DE DÉTAIL DU BRIEF ---
  isBriefDetailModalOpen: boolean = false;
  selectedBriefForModal: Brief | null = null;
  // --------------------------------------------------------------

  constructor(
    private authService: AuthService,
    private briefService: BriefService,
    private promoService: PromoService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    this.isLoading = true;
    const promoSub = this.promoService.getAllPromos().subscribe({
      next: (promos: Promo[]) => {
        promos.forEach(promo => {
          if (promo.id && promo.name) {
            this.promosMap.set(promo.id.toString(), promo.name);
          }
        });
        this.checkUserAndLoadBriefs();
      },
      error: (err: any) => {
        console.error("Erreur lors du chargement des promos:", err);
        this.errorMessage = "Impossible de charger les informations des promotions.";
        this.isLoading = false;
      }
    });
    this.subscriptions.add(promoSub);
  }

  private checkUserAndLoadBriefs(): void {
    if (this.currentUser && this.currentUser.role === 'apprenant' && this.currentUser.promoId) {
      this.loadBriefsForApprenant(this.currentUser.promoId);
    } else {
      this.isLoading = false;
      if (!this.currentUser?.promoId && this.currentUser?.role === 'apprenant') {
        this.errorMessage = "Impossible de charger les briefs : informations de promotion manquantes.";
      } else {
        this.errorMessage = "Accès non autorisé ou informations utilisateur incomplètes.";
      }
    }
  }

  loadBriefsForApprenant(promoId: string): void {
    this.errorMessage = null;
    const briefsSub = this.briefService.getBriefsByPromoId(promoId).subscribe({
      next: (briefsForPromo: Brief[]) => {
        this.apprenantBriefs = briefsForPromo;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error("Erreur lors du chargement des briefs pour l'apprenant:", err);
        this.errorMessage = "Une erreur est survenue lors du chargement de vos briefs.";
        this.isLoading = false;
      }
    });
    this.subscriptions.add(briefsSub);
  }

  getPromoName(promoId: string | number | undefined): string | undefined {
    if (promoId === undefined) return 'Promo non spécifiée';
    return this.promosMap.get(promoId.toString()) || `Promo ID: ${promoId}`;
  }

  // --- NOUVELLES MÉTHODES POUR GÉRER LA MODALE DE DÉTAIL DU BRIEF ---
  openBriefDetailModal(brief: Brief): void {
    this.selectedBriefForModal = brief;
    this.isBriefDetailModalOpen = true;
    console.log('Ouverture modale pour brief:', brief.title);
  }

  closeBriefDetailModal(): void {
    this.isBriefDetailModalOpen = false;
    this.selectedBriefForModal = null;
  }
  // --------------------------------------------------------------------

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}