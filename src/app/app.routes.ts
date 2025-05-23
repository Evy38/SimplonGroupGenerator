import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { authGuard } from './core/guards/auth.guard';
import { FormateurLayoutComponent } from './features/formateur/formateur-layout/formateur-layout.component';
import { FormateurDashboardComponent } from './features/formateur/formateur-dashboard/formateur-dashboard.component'; // Peut-être une page d'accueil du formateur
import { GroupListComponent } from './features/formateur/group-list/group-list.component';
import { BriefListComponent } from './features/formateur/brief-list/brief-list.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { BriefDetailComponent } from '../app/features/formateur/brief-detail/brief-detail.component';


export const routes: Routes = [
  { path: '', component: AuthComponent },
  {
    path: 'formateur',
    component: FormateurLayoutComponent, // Le layout principal pour la section formateur
    canActivate: [authGuard],
    data: { expectedRole: 'formateur' },
    children: [ // Routes enfants qui s'afficheront dans le <router-outlet> de FormateurLayoutComponent
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }, // Rediriger /formateur vers /formateur/dashboard
      { path: 'dashboard', component: FormateurDashboardComponent }, // Page d'accueil de la section formateur
      { path: 'groupes', component: GroupListComponent },
      { path: 'briefs', component: BriefListComponent },
      {path: 'profil', component: ProfileComponent,},
       { path: 'briefs/:id', component: BriefDetailComponent },
       
    ]
  },

  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirection par défaut si aucune route ne correspond
  { path: '**', redirectTo: '/login' }
];