// Dans app.routes.ts
import { Routes } from '@angular/router';
import { AuthComponent } from '../app/pages/auth/auth.component';
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
import { ApprenantBriefListComponent } from './features/apprenant/apprenant-brief-list/apprenant-brief-list.component';
import { ApprenantGroupeListComponent } from './features/apprenant/apprenant-groupe-list/apprenant-groupe-list.component';

export const routes: Routes = [
{
  path: 'auth',
  component: AuthComponent,

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
  component: ApprenantLayoutComponent,
  canActivate: [authGuard],
  data: { expectedRole: 'apprenant' }, // ou juste 'role'
  children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: ApprenantDashboardComponent },
    { path: 'mes-briefs', component: ApprenantBriefListComponent }, 
    { path: 'mes-groupes', component: ApprenantGroupeListComponent }, 
    { path: 'profil', component: ProfileComponent }, 
    { path: 'mes-groupes', component: ApprenantGroupeListComponent }
  ]
},

{ path: '', redirectTo: '/auth', pathMatch: 'full' },
{ path: '**', redirectTo: '/auth' } // Ou une page 404 si tu en as une

]