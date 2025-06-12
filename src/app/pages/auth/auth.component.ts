import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms'; // NgForm est optionnel si tu n'utilises pas #formRef="ngForm"
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Person } from '../../core/services/models/person.model'; // Assure-toi que ce chemin est correct
import { UserRole } from '../../core/services/models/user.model';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
  // --- Pour le formulaire de CONNEXION ---
  loginData = {
    email: '',
    password: ''
  };
  loginError: string | null = null;

  // --- Pour la MODALE et le formulaire d'INSCRIPTION ---
  isRegisterModalOpen: boolean = false;
  registrationStep: 'roleSelection' | 'formApprenant' | 'formFormateur' = 'roleSelection';

  // Données spécifiques pour l'inscription Apprenant
  registerApprenantData = {
    name: '',
    email: '',
    password: '',
    genre: '' as 'masculin' | 'feminin' | 'nsp' | '', // '' pour l'option "-- Sélectionnez --"
    aisanceFrancais: 0, // 0 pour l'option "-- Sélectionnez un niveau --"
    ancienDWWM: false,
    niveauTechnique: 0, // 0 pour l'option "-- Sélectionnez un niveau --"
    profil: '' as 'timide' | 'reserve' | 'alaise' | '', // '' pour l'option "-- Sélectionnez --"
    age: null as number | null
  };

  // Données spécifiques pour l'inscription Formateur
  registerFormateurData = {
    name: '', // Ajout du nom pour le formateur aussi, pour cohérence avec User model
    email: '',
    password: '',
    organizationName: ''
  };

  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

ngOnInit(): void {
  console.log('AuthComponent ngOnInit: Exécution de ngOnInit. URL actuelle:', this.router.url); // Log 1

  if (this.authService.isAuthenticated()) {
    const currentUserRole = this.authService.currentUserValue?.role;
    console.log('AuthComponent ngOnInit: Utilisateur déjà connecté. Rôle:', currentUserRole); // Log 2

    // IMPORTANT : Éviter de rediriger si on est déjà sur la bonne page cible ou si la redirection créerait une boucle
    const currentUrlIsAuth = this.router.url.includes('/auth'); // Ou === '/auth' si pas de sous-routes

    if (currentUserRole === 'formateur' && this.router.url !== '/formateur') { // Vérifie qu'on n'est pas déjà sur /formateur
      console.log('AuthComponent ngOnInit: Redirection vers /formateur'); // Log 3a
      this.router.navigate(['/formateur']);
    } else if (currentUserRole === 'apprenant' && this.router.url !== '/apprenant') { // Vérifie qu'on n'est pas déjà sur /apprenant
      console.log('AuthComponent ngOnInit: Redirection vers /apprenant'); // Log 3b
      this.router.navigate(['/apprenant']);
    } else if (currentUserRole && currentUrlIsAuth) {
  
      console.log('AuthComponent ngOnInit: Utilisateur connecté sur /auth avec un rôle non géré pour redirection spécifique, redirection vers / (ou page daccueil par défaut).'); 
   
    } else {
      console.log('AuthComponent ngOnInit: Utilisateur connecté, mais pas de redirection nécessaire depuis cette URL ou rôle non géré pour une redirection spécifique.');
    }
  } else {
    console.log('AuthComponent ngOnInit: Utilisateur non connecté. Affichage de la page AuthComponent.'); // Log 4
  }
}
  // --- MÉTHODES POUR LA CONNEXION ---
  onLoginSubmit(): void {
    console.log('AuthComponent: onLoginSubmit appelé avec:', this.loginData);
    this.loginError = null;

    if (!this.loginData.email || !this.loginData.password) {
        this.loginError = 'L\'email et le mot de passe sont requis.';
        return;
    }

    const success = this.authService.login(this.loginData.email, this.loginData.password);

    if (success) {
      const currentUser = this.authService.currentUserValue;
      console.log('AuthComponent: Connexion réussie, utilisateur:', currentUser);
      if (currentUser?.role === 'formateur') {
        this.router.navigate(['/formateur']);
      } else if (currentUser?.role === 'apprenant') {
        this.router.navigate(['/apprenant']);
      } else {
        // Redirection par défaut si rôle non géré ou utilisateur sans rôle (ne devrait pas arriver)
        this.router.navigate(['/']);
      }
    } else {
      this.loginError = 'Email ou mot de passe incorrect.';
      console.warn('AuthComponent: Échec de la connexion.');
    }
  }

  // --- MÉTHODES POUR LA MODALE D'INSCRIPTION ---
  openRegisterModal(): void {
    this.isRegisterModalOpen = true;
    this.registrationStep = 'roleSelection';
    this.loginError = null;
    this.resetRegisterForms();
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
    this.registerError = null;
    this.registerSuccess = null;
  }

  selectRole(role: 'apprenant' | 'formateur'): void {
    if (role === 'apprenant') {
      this.registrationStep = 'formApprenant';
    } else if (role === 'formateur') {
      this.registrationStep = 'formFormateur';
    }
    this.resetRegisterForms(); // Réinitialiser les champs si on change de rôle
  }

  backToRoleSelection(): void {
    this.registrationStep = 'roleSelection';
    this.resetRegisterForms();
  }

  onRegisterApprenantSubmit(): void {
    this.registerError = null;
    this.registerSuccess = null;
    console.log('AuthComponent: onRegisterApprenantSubmit appelé avec:', this.registerApprenantData);

    // Validation
    if (
      !this.registerApprenantData.name || !this.registerApprenantData.email ||
      !this.registerApprenantData.password || !this.registerApprenantData.genre ||
      this.registerApprenantData.aisanceFrancais === 0 ||
      this.registerApprenantData.niveauTechnique === 0 ||
      !this.registerApprenantData.profil || this.registerApprenantData.age === null ||
      this.registerApprenantData.age < 1
    ) {
      this.registerError = 'Veuillez remplir tous les champs obligatoires correctement.';
      console.warn('AuthComponent: Validation inscription apprenant échouée.');
      return;
    }

    const userDataForAuth = {
      name: this.registerApprenantData.name,
      email: this.registerApprenantData.email,
      password: this.registerApprenantData.password,
    };

    const personDetails: Partial<Person> = {
      genre: this.registerApprenantData.genre,
      aisanceFrancais: Number(this.registerApprenantData.aisanceFrancais),
      ancienDWWM: this.registerApprenantData.ancienDWWM,
      niveauTechnique: Number(this.registerApprenantData.niveauTechnique),
      profil: this.registerApprenantData.profil,
      age: this.registerApprenantData.age !== null ? Number(this.registerApprenantData.age) : null,
      // nom: this.registerApprenantData.name, // Peut être redondant si User a déjà name
      // email: this.registerApprenantData.email, // Idem
      // role: 'apprenant' // Le rôle est déjà passé à registerUser
    };

    const registrationResult = this.authService.registerUser(userDataForAuth, UserRole.APPRENANT);

    if (registrationResult.success) {
      this.registerSuccess = `Compte Apprenant pour ${this.registerApprenantData.name} créé avec succès ! Vous pouvez maintenant vous connecter.`;
      console.log('AuthComponent: Inscription apprenant réussie.', registrationResult);
       this.resetRegisterForms();
      // Optionnel: fermer la modale après un délai
      // setTimeout(() => this.closeRegisterModal(), 4000);
    } else {
      this.registerError = registrationResult.message || 'Une erreur est survenue lors de l\'inscription.';
      console.error('AuthComponent: Échec inscription apprenant.', registrationResult);
    }
  }

  onRegisterFormateurSubmit(): void {
    this.registerError = null;
    this.registerSuccess = null;
    console.log('AuthComponent: onRegisterFormateurSubmit appelé avec:', this.registerFormateurData);

    if (!this.registerFormateurData.name || !this.registerFormateurData.email || !this.registerFormateurData.password) {
      this.registerError = 'Nom, email et mot de passe sont obligatoires pour le formateur.';
      console.warn('AuthComponent: Validation inscription formateur échouée.');
      return;
    }

    const userDataForAuth = {
      name: this.registerFormateurData.name,
      email: this.registerFormateurData.email,
      password: this.registerFormateurData.password,
    };
    // Pour le formateur, nous ne passons pas de 'details' de type Person selon ce modèle.
    // Si le formateur avait des champs spécifiques (comme organizationName DANS Person), on les passerait.
    // Ici, organizationName est dans registerFormateurData mais pas directement utilisé par Person.

    const registrationResult = this.authService.registerUser(userDataForAuth, UserRole.FORMATEUR);

    if (registrationResult.success) {
      this.registerSuccess = `Compte Formateur pour ${this.registerFormateurData.name} créé avec succès ! Vous pouvez maintenant vous connecter.`;
      console.log('AuthComponent: Inscription formateur réussie.', registrationResult);
      this.resetRegisterForms();
      // Optionnel: fermer la modale après un délai
      // setTimeout(() => this.closeRegisterModal(), 4000);
    } else {
      this.registerError = registrationResult.message || 'Une erreur est survenue lors de l\'inscription.';
      console.error('AuthComponent: Échec inscription formateur.', registrationResult);
    }
  }

  private resetRegisterForms(): void {
    // Réinitialisation pour Apprenant
    this.registerApprenantData = {
      name: '', email: '', password: '', genre: '', aisanceFrancais: 0,
      ancienDWWM: false, niveauTechnique: 0, profil: '', age: null
    };
    // Réinitialisation pour Formateur
    this.registerFormateurData = {
      name: '', email: '', password: '', organizationName: ''
    };
    this.registerError = null;
    this.registerSuccess = null; // Aussi réinitialiser le message de succès
  }
}