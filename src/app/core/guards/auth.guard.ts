import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Ajuste le chemin


// Dans auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard: Vérification pour la route:', state.url); // Log de débogage

  if (authService.isAuthenticated()) {
    const expectedRole = route.data?.['expectedRole'] as string | undefined; // Soyons explicite sur le type
    const currentUser = authService.currentUserValue;

    console.log('AuthGuard: Utilisateur connecté.', 'Rôle attendu:', expectedRole, 'Rôle actuel:', currentUser?.role);

    if (expectedRole && (!currentUser || currentUser.role !== expectedRole)) {
      console.warn(`AuthGuard: Rôle incorrect. Attendu: ${expectedRole}, Actuel: ${currentUser?.role}. Redirection vers /auth.`);
      router.navigate(['/auth']); // Rediriger vers la page d'authentification
      return false;
    }
    console.log('AuthGuard: Accès autorisé.');
    return true;
  }

  console.warn("AuthGuard: Utilisateur non connecté. Redirection vers /auth.");
  router.navigate(['/auth'], { queryParams: { returnUrl: state.url } }); // Optionnel: garder l'URL de retour
  return false;
};