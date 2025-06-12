import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service'; 
import { User } from '../../../core/services/models/user.model';    

@Component({
  selector: 'app-apprenant-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './apprenant-dashboard.component.html',
  styleUrls: ['./apprenant-dashboard.component.css']
})

export class ApprenantDashboardComponent implements OnInit {
  currentUser: User | null = null;
  welcomeMessage: string = "Bienvenue sur votre Dashboard !"; // Message par défaut

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUserValue;
    if (this.currentUser && this.currentUser.name) {
      this.welcomeMessage = `Bienvenue, ${this.currentUser.name} !`;
    }
  }
}