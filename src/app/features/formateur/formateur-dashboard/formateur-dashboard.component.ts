// src/app/features/formateur/formateur-dashboard/formateur-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Pour *ngIf, {{ }} etc.
import { AuthService } from '../../../core/services/auth.service'; // Ajuste le chemin si besoin

@Component({
  selector: 'app-formateur-dashboard',
  standalone: true,
  imports: [CommonModule], // CommonModule est nécessaire pour les liaisons {{ }}
  templateUrl: './formateur-dashboard.component.html',
  styleUrl: './formateur-dashboard.component.css'
})
export class FormateurDashboardComponent implements OnInit {
  userName: string | undefined = 'Formateur'; // Valeur par défaut au cas où

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Récupérer le nom de l'utilisateur connecté depuis le service
    const currentUser = this.authService.currentUserValue;
    if (currentUser && currentUser.name) {
      this.userName = currentUser.name;
    }

  }


}