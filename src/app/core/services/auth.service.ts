import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs'; // Observable ajouté pour currentUser$
import { User, UserRole } from '../../core/services/models/user.model'; // Correction du chemin vers core/models

import { Router } from '@angular/router';


const INITIAL_MOCK_USERS: User[] = [
  { id: 'user-formateur-id', email: 'formateur@test.com', name: 'Formateur Test', role: UserRole.FORMATEUR, password: 'password' },
  { id: 'user-apprenant-id', email: 'apprenant@test.com', name: 'Apprenant Test', role: UserRole.APPRENANT, password: 'password', promoId: "grpPoneys" },
];

const USER_STORAGE_KEY = 'currentUserSimplonApp'; // Clé pour localStorage
const ALL_USERS_STORAGE_KEY = 'allUsersSimplonApp'; // Clé pour persister la liste des utilisateurs si besoin

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<User | null>;
  public currentUser$: Observable<User | null>;

  // La liste des utilisateurs sera modifiée par l'inscription.
  // Elle est chargée depuis localStorage ou initialisée.
  private users: User[];

  constructor(private router: Router) {
    // 1. Charger la liste complète des utilisateurs depuis localStorage (si elle existe)
    const storedAllUsers = localStorage.getItem(ALL_USERS_STORAGE_KEY);
    if (storedAllUsers) {
      this.users = JSON.parse(storedAllUsers);
    } else {
      // Sinon, initialiser avec une COPIE des utilisateurs initiaux et sauvegarder
      this.users = [...INITIAL_MOCK_USERS];
      // Optionnel: sauvegarder directement les utilisateurs initiaux si on veut qu'ils soient persistants
      // localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(this.users));
    }
    console.log('AuthService: Users list initialized/loaded:', this.users);

    // 2. Essayer de charger l'utilisateur connecté depuis localStorage au démarrage
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    this.currentUserSubject = new BehaviorSubject<User | null>(storedUser ? JSON.parse(storedUser) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
    console.log('AuthService initialized. Current user from storage:', this.currentUserSubject.value);
  }

  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string, password?: string): boolean {
    console.log(`AuthService: Tentative de connexion pour : ${email}`);
    // console.log('AuthService: Liste des utilisateurs au moment du login:', JSON.parse(JSON.stringify(this.users)));

    const user = this.users.find(u => u.email === email && u.password === password);

   if (user) {
  console.log(`AuthService LOGIN: Tentative de sauvegarde de l'utilisateur dans localStorage avec la clé: ${USER_STORAGE_KEY}`, user); // NOUVEAU LOG
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  this.currentUserSubject.next(user);
  console.log('AuthService: Connexion réussie pour:', user);
  return true;
}

    console.warn('AuthService: Échec de la connexion - identifiants incorrects ou utilisateur non trouvé.');
    // S'assurer que localStorage est vidé si la connexion échoue après une tentative précédente
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    return false;
  }

  logout(): void {
    console.log('AuthService: Déconnexion');
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth']);
  }

  registerUser(
    userData: { name: string; email: string; password?: string },
    role: UserRole
    // details?: Partial<Person> // Si vous gérez les détails Person ici
  ): { success: boolean; message?: string; user?: User } { // Retourne l'utilisateur créé
    const userPassword = userData.password;
    if (!userPassword) {
      console.error('AuthService.registerUser: Tentative d\'enregistrement sans mot de passe.');
      return { success: false, message: 'Le mot de passe est requis pour l\'inscription.' };
    }

    console.log('AuthService.registerUser - Données reçues:', userData, 'Rôle:', role);

    if (this.users.find(u => u.email === userData.email)) {
      console.warn(`AuthService.registerUser: Échec - email ${userData.email} déjà utilisé.`);
      return { success: false, message: 'Cet email est déjà utilisé.' };
    }

    const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const newUser: User = {
      id: newUserId,
      email: userData.email,
      password: userPassword, // Assurez-vous de hasher les mdp en production !
      name: userData.name,
      role: role,
    };

    this.users.push(newUser);
    // Sauvegarder la liste mise à jour des utilisateurs dans localStorage
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(this.users));

    console.log('AuthService.registerUser: Nouvel utilisateur ajouté:', newUser);
    console.log('AuthService.registerUser: Liste complète des utilisateurs après ajout:', this.users);

    // Optionnel : connecter l'utilisateur directement après inscription
    // localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
    // this.currentUserSubject.next(newUser);

    return { success: true, user: newUser, message: 'Utilisateur enregistré avec succès.' };
  }

  isAuthenticated(): boolean {
    // Renommé de isLoggedIn pour cohérence
    return !!this.currentUserSubject.value;
  }

  hasRole(expectedRole: UserRole): boolean {
    return this.currentUserValue?.role === expectedRole;
  }

  // La méthode getUserRole n'est pas définie ici mais est utilisée par le guard.
  // Si vous l'avez dans le guard, c'est ok, sinon on peut l'ajouter :
  getUserRole(): UserRole | null {
    return this.currentUserValue?.role || null;
  }
updateUserPassword(userId: string, newPasswordValue: string): void {
  const userIndex = this.users.findIndex(u => u.id === userId);
  if (userIndex > -1) {
    // Mettre à jour dans la liste en mémoire this.users
    this.users[userIndex] = { ...this.users[userIndex], password: newPasswordValue };
    console.log('AuthService: Mot de passe mis à jour en mémoire pour', this.users[userIndex].email);

    // Si l'utilisateur mis à jour est l'utilisateur actuellement connecté, mettre à jour le currentUserSubject et localStorage
    if (this.currentUserSubject.value && this.currentUserSubject.value.id === userId) {
      const updatedCurrentUser = { ...this.currentUserSubject.value, password: newPasswordValue };
      this.currentUserSubject.next(updatedCurrentUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedCurrentUser));
      console.log('AuthService: Utilisateur connecté mis à jour (mot de passe) et sauvegardé dans localStorage.');
    }

    // Sauvegarder la liste complète des utilisateurs (avec le nouveau mot de passe)
    localStorage.setItem(ALL_USERS_STORAGE_KEY, JSON.stringify(this.users));
  } else {
    console.warn('AuthService: Utilisateur non trouvé pour la mise à jour du mot de passe, ID:', userId);
  }
}}