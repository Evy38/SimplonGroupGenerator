import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule, ],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css' 
})

export class AuthComponent {
// --- Pour le formulaire de CONNEXION  ---
  loginData = {
    email: '',
    password: ''
  };
  loginError: string | null = null;

  // --- Pour la MODALE et le formulaire d'INSCRIPTION ---
  isRegisterModalOpen: boolean = false; // Contrôle l'affichage de la modale
  registrationStep: 'roleSelection' | 'formApprenant' | 'formFormateur' = 'roleSelection'; // Étapes dans la modale

  // Données communes pour les deux types d'inscription
  registerBaseData = {
    email: '',
    password: ''
  };

  // Données spécifiques pour l'inscription Apprenant
  registerApprenantData = {
    ...this.registerBaseData,
    name: '', // Nom complet
    genre: '' as 'masculin' | 'feminin' | 'nsp' | '', // nsp = ne se prononce pas, '' = non sélectionné
    aisanceFrancais: 0, // 1 à 4 (0 si non sélectionné)
    ancienDWWM: false,
    niveauTechnique: 0, // 1 à 4
    profil: '' as 'timide' | 'reserve' | 'alaise' | '',
    age: null as number | null // Pour permettre un champ vide initialement
  };

  // Données spécifiques pour l'inscription Formateur
 registerFormateurData = {
    ...this.registerBaseData,
    name: '', // Le formateur a aussi un nom
    organizationName: '',
  };

  registerError: string | null = null;
  registerSuccess: string | null = null;

  constructor() {}

  // --- MÉTHODES POUR LA CONNEXION (restent les mêmes) ---
  onLoginSubmit(): void {
    this.loginError = null;
    console.log('Données de connexion soumises :', this.loginData);
    // ... (Logique de simulation de connexion)
    if (this.loginData.email === 'formateur@test.com' && this.loginData.password === 'password') {
      console.log('Connexion réussie en tant que formateur !');
    } else if (this.loginData.email === 'apprenant@test.com' && this.loginData.password === 'password') {
      console.log('Connexion réussie en tant qu\'apprenant !');
    } else {
      this.loginError = 'Email ou mot de passe incorrect.';
    }
  }

  // --- MÉTHODES POUR LA MODALE D'INSCRIPTION ---
  openRegisterModal(): void {
    this.isRegisterModalOpen = true;
    this.registrationStep = 'roleSelection'; // Toujours commencer par la sélection du rôle
    this.loginError = null; // Effacer les erreurs du formulaire de connexion
    this.resetRegisterForm(); // Réinitialiser les formulaires d'inscription
  }

  closeRegisterModal(): void {
    this.isRegisterModalOpen = false;
    this.registerError = null;
    this.registerSuccess = null;
  }

  // Sélection du rôle dans la modale
  selectRole(role: 'apprenant' | 'formateur'): void {
    if (role === 'apprenant') {
      this.registrationStep = 'formApprenant';
    } else if (role === 'formateur') {
      this.registrationStep = 'formFormateur';
    }
    this.resetRegisterForm(); // Réinitialiser au cas où on change de rôle
  }

  // Revenir à la sélection du rôle depuis un formulaire d'inscription
  backToRoleSelection(): void {
    this.registrationStep = 'roleSelection';
    this.resetRegisterForm();
  }

  // Soumission du formulaire d'inscription Apprenant
  onRegisterApprenantSubmit(): void {
    this.registerError = null;
    this.registerSuccess = null;
    console.log('Inscription Apprenant soumise :', this.registerApprenantData);

    if (!this.registerApprenantData.name || !this.registerApprenantData.email || !this.registerApprenantData.password) {
      this.registerError = "Tous les champs sont obligatoires.";
      return;
    }
    // Simulation
    this.registerSuccess = `Compte Apprenant pour ${this.registerApprenantData.name} créé !`;
    // Idéalement, fermer la modale ou afficher un message puis fermer
    // setTimeout(() => this.closeRegisterModal(), 2000);
  }

  // Soumission du formulaire d'inscription Formateur
  onRegisterFormateurSubmit(): void {
    this.registerError = null;
    this.registerSuccess = null;
    console.log('Inscription Formateur soumise :', this.registerFormateurData);

    if (!this.registerFormateurData.organizationName || !this.registerFormateurData.email || !this.registerFormateurData.password) {
      this.registerError = "Tous les champs sont obligatoires.";
      return;
    }
    // Simulation
    this.registerSuccess = `Compte Formateur pour ${this.registerFormateurData.organizationName} créé !`;
    // setTimeout(() => this.closeRegisterModal(), 2000);
  }

  // Helper pour réinitialiser les formulaires d'inscription
  private resetRegisterForm(): void {
    this.registerBaseData = { email: '', password: '' };
    this.registerApprenantData = {
      ...this.registerBaseData, name: '', genre: '', aisanceFrancais: 0,
      ancienDWWM: false, niveauTechnique: 0, profil: '', age: null
    };
    this.registerFormateurData = { ...this.registerBaseData, name: '', organizationName: '' };
    this.registerError = null;
    this.registerSuccess = null;
  }
}