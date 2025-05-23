import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserRole } from '../services/models/user.model'; // Ajuste le chemin si besoin

@Injectable({
  providedIn: 'root' // Service disponible globalement
})

export class AuthService {
  // BehaviorSubject pour stocker l'utilisateur courant et notifier les changements
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser: Observable<User | null>;

  // Liste simulée d'utilisateurs (pour la démo)
  // DANS UNE VRAIE APP, CELA VIENDRAIT D'UN BACKEND !
  private mockUsers: User[] = [
    { id: 1, email: 'formateur@test.com', name: 'Professeur Test', role: 'formateur' },
    { id: 2, email: 'apprenant@test.com', name: 'Élève Test', role: 'apprenant' },
    // Tu pourrais ajouter d'autres utilisateurs ici pour tes tests
  ];

// Dans auth.service.ts - constructeur
constructor(private router: Router) {
  let initialUser: User | null = null;
  const storedUserString = localStorage.getItem('currentUser');
  if (storedUserString) {
    try {
      initialUser = JSON.parse(storedUserString) as User; // Tenter de parser
    } catch (e) {
      console.error("AuthService: Erreur lors du parsing de l'utilisateur depuis localStorage", e);
      localStorage.removeItem('currentUser'); // Supprimer la valeur invalide
      initialUser = null; // Revenir à un état initial propre
    }
  }
  this.currentUserSubject = new BehaviorSubject<User | null>(initialUser);
  this.currentUser = this.currentUserSubject.asObservable();
}

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password_NE_PAS_UTILISER_EN_PROD: string): boolean {
    // DANS UNE VRAIE APP, ON NE COMPARE PAS LES MOTS DE PASSE EN CLAIR !
    // Ceci est UNIQUEMENT pour la simulation.
    const user = this.mockUsers.find(u => u.email === email);

    if (user && password_NE_PAS_UTILISER_EN_PROD === 'password') { // Mot de passe simulé
      localStorage.setItem('currentUser', JSON.stringify(user)); // Stocker dans localStorage
      this.currentUserSubject.next(user); // Émettre la nouvelle valeur
      console.log('AuthService: Connexion réussie pour', user.email, 'avec rôle', user.role);
      return true;
    }
    console.log('AuthService: Échec de la connexion pour', email);
    this.logout(); // S'assurer qu'il n'y a pas d'utilisateur stocké en cas d'échec
    return false;
  }

  logout(): void {
    localStorage.removeItem('currentUser'); // Supprimer du localStorage
    this.currentUserSubject.next(null); // Émettre null
    this.router.navigate(['/']); // Rediriger vers la page de connexion (ou la page d'accueil)
    console.log('AuthService: Déconnexion');
  }

  isLoggedIn(): boolean {
    return !!this.currentUserValue; // Convertit en booléen (vrai si utilisateur existe, faux sinon)
  }

  hasRole(role: UserRole): boolean {
    return this.currentUserValue?.role === role;
  }

  // Méthode pour l'inscription (simplifiée pour l'instant)
  // On y reviendra pour la rendre plus robuste
  register(userData: Omit<User, 'id'>): { success: boolean, message: string } {
    const existingUser = this.mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }
    const newUser: User = {
      id: Date.now(), // Générer un ID simple pour la démo
      ...userData
    };
    this.mockUsers.push(newUser);
    console.log('AuthService: Nouvel utilisateur enregistré (simulé):', newUser);
    // Dans un vrai scénario, on ne connecterait pas forcément l'utilisateur direct après inscription,
    // ou on le ferait avec un appel à login().
    return { success: true, message: 'Inscription réussie !' };
  }
}