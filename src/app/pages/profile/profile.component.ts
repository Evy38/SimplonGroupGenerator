import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour @if, etc.
import { FormsModule } from '@angular/forms'; // Pour ngModel si on fait un formulaire de changement de mdp

import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/services/models/user.model';
import { Person } from '../../core/services/models/person.model'; // Si vous voulez afficher plus de détails
import { PromoService } from '../../core/services/promo.service';
import { Group } from '../../core/services/models/group.model'; // 'Group' est utilisé pour les Promos

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule], // FormsModule ajouté
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  personDetails: Person | null = null; // Pour les détails supplémentaires de l'apprenant
  userPromos: Group[] = []; // Promos de l'utilisateur

  // Pour la simulation de changement de mot de passe
  showPasswordForm = false;
  currentPassword = ''; // Simulé, pas vraiment vérifié
  newPassword = '';
  confirmNewPassword = '';
  passwordChangeMessage = '';
  passwordFieldType = 'password'; // Pour afficher/masquer le mdp

  constructor(
    private authService: AuthService,
    private promoService: PromoService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;

    if (this.currentUser && this.currentUser.email) {
      // Récupérer les promos de l'utilisateur
      this.promoService.promos$.subscribe(allPromos => {
        this.userPromos = allPromos.filter(promo =>
          promo.members.some(member => member.email === this.currentUser?.email)
        );

        // Essayer de trouver les détails 'Person' correspondants dans la première promo trouvée
        // (Hypothèse simplifiée: un apprenant est principalement dans une promo active à la fois pour les détails 'Person')
        if (this.userPromos.length > 0) {
          const firstPromo = this.userPromos[0];
          this.personDetails = firstPromo.members.find(member => member.email === this.currentUser?.email) || null;
        }
      });
    }
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.passwordChangeMessage = ''; // Réinitialiser le message
    // Réinitialiser les champs
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  togglePasswordVisibility(): void {
    this.passwordFieldType = this.passwordFieldType === 'password' ? 'text' : 'password';
  }

  handleChangePassword(): void {
    if (!this.currentUser) return;

    if (this.newPassword.length < 6) {
      this.passwordChangeMessage = 'Le nouveau mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      this.passwordChangeMessage = 'Les nouveaux mots de passe ne correspondent pas.';
      return;
    }

    // --- SIMULATION DE CHANGEMENT DE MOT DE PASSE ---
    // Dans une vraie application, vous appelleriez un service backend ici.
    // Ici, nous allons juste mettre à jour l'objet currentUser en mémoire (et dans localStorage via AuthService).
    console.log(`Simulation: Mot de passe demandé à changer de "${this.currentPassword}" à "${this.newPassword}"`);

    // Mettre à jour l'utilisateur dans AuthService (simulé)
    // Idéalement, AuthService aurait une méthode updateUser ou updatePassword
    const updatedUser = { ...this.currentUser, password: this.newPassword };

    // Simuler la mise à jour dans la liste mockUsers de AuthService (si vous voulez que ça persiste un peu plus)
    // Cette partie est délicate car mockUsers est souvent une constante.
    // Pour une simulation complète, il faudrait que AuthService puisse modifier sa liste `users`.
    // Le plus simple ici est de mettre à jour le currentUser stocké et le localStorage.

    this.authService.updateUserPassword(this.currentUser.id, this.newPassword); // Supposons que cette méthode existe dans AuthService
    this.currentUser = this.authService.currentUserValue; // Recharger l'utilisateur mis à jour

    this.passwordChangeMessage = 'Mot de passe changé avec succès (simulation) !';
    this.showPasswordForm = false;
  }
}