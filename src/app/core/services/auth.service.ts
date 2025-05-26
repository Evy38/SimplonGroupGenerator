import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User, UserRole } from '../../core/services/models/user.model';
import { Person } from '../../core/services/models/person.model'; // Assure-toi que ce chemin est correct

// Utilisateurs initiaux (ceux avec lesquels tu peux te connecter au début)
const INITIAL_MOCK_USERS: User[] = [
  { id: 'user-formateur-id', email: 'formateur@test.com', name: 'Formateur Test', role: 'formateur', password: 'password' },
  { id: 'user-apprenant-id', email: 'apprenant@test.com', name: 'Apprenant Test', role: 'apprenant', password: 'password' },
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable(); // Convention de nommer les Observables avec $

  // La liste des utilisateurs sera modifiée par l'inscription.
  // On initialise avec une COPIE des utilisateurs initiaux.
  private users: User[] = [...INITIAL_MOCK_USERS];

  // Optionnel : Si tu veux gérer une liste de Personnes séparée (pourrait être utile plus tard)
  // private people: Person[] = []; // Pense à initialiser si besoin

  constructor() {
    console.log('AuthService instancié. Utilisateurs initiaux:', JSON.parse(JSON.stringify(this.users)));
    // Pour une persistance de session très basique (décommenter si besoin)
    // this.loadUserFromLocalStorage();
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, passwordAttempt: string): boolean {
    console.log(`AuthService: Tentative de connexion pour : ${email}`);
    console.log('AuthService: Liste des utilisateurs au moment du login:', JSON.parse(JSON.stringify(this.users)));

    const user = this.users.find(u => u.email === email && u.password === passwordAttempt);

    if (user) {
      this.currentUserSubject.next(user);
      // this.saveUserToLocalStorage(user); // Pour persistance
      console.log('AuthService: Connexion réussie pour:', user);
      return true;
    }

    console.warn('AuthService: Échec de la connexion - identifiants incorrects ou utilisateur non trouvé.');
    return false;
  }

  logout(): void {
    this.currentUserSubject.next(null);
    // localStorage.removeItem('currentUserSimplonGroupApp'); // Pour persistance
    console.log('AuthService: Utilisateur déconnecté.');
    // Important : rediriger vers la page de connexion depuis le composant qui appelle logout.
  }

  registerUser(
    userData: { name: string; email: string; password?: string },
    role: UserRole,
    details?: Partial<Person>
  ): { success: boolean; message?: string; userId?: string } {
    const userPassword = userData.password;
    if (!userPassword) {
      console.error('AuthService.registerUser: Tentative d\'enregistrement sans mot de passe.');
      return { success: false, message: 'Le mot de passe est requis pour l\'inscription.' };
    }

    console.log('AuthService.registerUser - Données reçues:', userData, 'Rôle:', role, 'Détails:', details);

    if (this.users.find(u => u.email === userData.email)) {
      console.warn(`AuthService.registerUser: Échec - email ${userData.email} déjà utilisé.`);
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: User = {
      id: newUserId,
      email: userData.email,
      password: userPassword,
      name: userData.name,
      role: role,
    };

    this.users.push(newUser);
    console.log('AuthService.registerUser: Nouvel utilisateur ajouté à this.users:', newUser);
    console.log('AuthService.registerUser: Liste complète des utilisateurs après ajout:', JSON.parse(JSON.stringify(this.users)));

    // Logique optionnelle si tu gères une liste de Personnes séparément :
    // if (role === 'apprenant' && details) {
    //   const newPersonData: Person = {
    //     id: newUserId,
    //     nom: details.nom || userData.name,
    //     email: details.email || userData.email,
    //     role: 'apprenant',
    //     genre: details.genre || 'nsp',
    //     aisanceFrancais: details.aisanceFrancais || 1,
    //     ancienDWWM: details.ancienDWWM || false,
    //     niveauTechnique: details.niveauTechnique || 1,
    //     profil: details.profil || 'timide',
    //     age: details.age || null, // Garder null si c'est ce que le modèle Person attend pour un âge non défini
    //   };
    //   // this.people.push(newPersonData);
    //   console.log('AuthService.registerUser: Détails Person créés/associés (simulation):', newPersonData);
    // }

    return { success: true, userId: newUser.id, message: 'Utilisateur enregistré avec succès.' };
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  hasRole(expectedRole: UserRole): boolean {
    return this.currentUserValue?.role === expectedRole;
  }

  // Méthodes pour une persistance de session basique (optionnel)
  /*
  private saveUserToLocalStorage(user: User): void {
    localStorage.setItem('currentUserSimplonGroupApp', JSON.stringify(user));
  }

  private loadUserFromLocalStorage(): void {
    const userJson = localStorage.getItem('currentUserSimplonGroupApp');
    if (userJson) {
      const user = JSON.parse(userJson);
      this.currentUserSubject.next(user);
      console.log('AuthService: Utilisateur chargé depuis localStorage:', user);
    }
  }
  */
}