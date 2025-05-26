// Dans app.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { authGuard } from './core/guards/auth.guard';
import { FormateurLayoutComponent } from './features/formateur/formateur-layout/formateur-layout.component';
import { FormateurDashboardComponent } from './features/formateur/formateur-dashboard/formateur-dashboard.component';
import { PromoListComponent } from './features/formateur/promo-list/promo-list.component';
import { BriefListComponent } from './features/formateur/brief-list/brief-list.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BriefDetailComponent } from './features/formateur/brief-detail/brief-detail.component';
// Importe tes composants pour la section Apprenant si tu en as
import { ApprenantLayoutComponent } from './features/apprenant/apprenant-layout/apprenant-layout.component';
import { ApprenantDashboardComponent } from './features/apprenant/apprenant-dashboard/apprenant-dashboard.component';


export const routes: Routes = [
  // 1. Route explicite pour l'authentification
  {
    path: 'auth',
    component: AuthComponent,
    // Tu pourrais ajouter un guard ici pour rediriger si déjà connecté,
    // mais la logique dans AuthComponent.ngOnInit s'en charge déjà.
  },

  // 2. Section Formateur (protégée)
  {
    path: 'formateur',
    component: FormateurLayoutComponent,
    canActivate: [authGuard],
    data: { expectedRole: 'formateur' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: FormateurDashboardComponent },
      { path: 'promos', component: PromoListComponent },
      { path: 'briefs', component: BriefListComponent },
      { path: 'briefs/:id', component: BriefDetailComponent },
      { path: 'profil', component: ProfileComponent }, // Profil accessible depuis la section formateur
    ]
  },

  {
    path: 'apprenant',
    component: ApprenantLayoutComponent, // Remplace par ton layout/composant apprenant
    canActivate: [authGuard],
    data: { expectedRole: 'apprenant' },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: ApprenantDashboardComponent }, // Ta page d'accueil apprenant
      // ... autres routes spécifiques à l'apprenant ...
      { path: 'profil', component: ProfileComponent }, // Profil accessible depuis la section apprenant
    ]
  },

  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth' }
];