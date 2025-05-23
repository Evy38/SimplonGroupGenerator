import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste le chemin


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Vérifier le rôle si la route a des données de rôle attendu
    const expectedRole = route.data?.['expectedRole'];
    if (expectedRole && !authService.hasRole(expectedRole)) {
      console.warn(`AuthGuard: Rôle ${expectedRole} attendu, mais l'utilisateur a le rôle ${authService.currentUserValue?.role}. Redirection.`);
      router.navigate(['/']); // Ou une page "accès refusé"
      return false;
    }
    return true; // L'utilisateur est connecté (et a le bon rôle si spécifié)
  }

  // Non connecté, redirection vers la page de connexion
  console.warn("AuthGuard: Utilisateur non connecté. Redirection vers la page de connexion.");
  router.navigate(['/']); // Ou state.url pour essayer de rediriger après connexion
  return false;
};