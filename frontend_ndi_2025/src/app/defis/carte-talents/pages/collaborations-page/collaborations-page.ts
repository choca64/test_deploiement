import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CollaborationService, CollaborationRequest } from '../../services/collaboration.service';
import { AuthService, User } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-collaborations-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './collaborations-page.html',
  styleUrls: ['./collaborations-page.css']
})
export class CollaborationsPage implements OnInit, OnDestroy {
  requests: CollaborationRequest[] = [];
  currentUser: User | null = null;
  private subscriptions: Subscription[] = [];

  constructor(
    private collaborationService: CollaborationService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    this.subscriptions.push(
      this.collaborationService.requests$.subscribe(requests => {
        this.requests = requests;
      }),
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  /**
   * Vérifier si une demande a été envoyée par l'utilisateur connecté
   */
  isSentByMe(request: CollaborationRequest): boolean {
    if (!this.currentUser) return false;
    return request.fromUserId === this.currentUser.id || 
           request.fromEmail === this.currentUser.email;
  }

  /**
   * Demandes reçues (envoyées par d'autres)
   */
  getReceivedPendingRequests(): CollaborationRequest[] {
    return this.requests.filter(r => r.status === 'pending' && !this.isSentByMe(r));
  }

  /**
   * Demandes envoyées par moi
   */
  getSentPendingRequests(): CollaborationRequest[] {
    return this.requests.filter(r => r.status === 'pending' && this.isSentByMe(r));
  }

  getPendingRequests(): CollaborationRequest[] {
    return this.requests.filter(r => r.status === 'pending');
  }

  getAcceptedRequests(): CollaborationRequest[] {
    return this.requests.filter(r => r.status === 'accepted');
  }

  getDeclinedRequests(): CollaborationRequest[] {
    return this.requests.filter(r => r.status === 'declined');
  }

  getProjectTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'collaboration': '🤝 Collaboration',
      'mentoring': '📚 Mentorat',
      'job': '💼 Opportunité',
      'learning': '🎓 Échange',
      'other': '💬 Autre'
    };
    return labels[type] || type;
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'pending': '⏳ En attente',
      'accepted': '✅ Acceptée',
      'declined': '❌ Refusée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status--${status}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  acceptRequest(id: string) {
    this.collaborationService.updateRequestStatus(id, 'accepted');
  }

  declineRequest(id: string) {
    this.collaborationService.updateRequestStatus(id, 'declined');
  }

  deleteRequest(id: string) {
    if (confirm('Supprimer cette demande ?')) {
      this.collaborationService.deleteRequest(id);
    }
  }

  openEmail(email: string, request: CollaborationRequest) {
    const subject = encodeURIComponent(`Re: Demande de ${this.getProjectTypeLabel(request.projectType)}`);
    const body = encodeURIComponent(`Bonjour ${request.fromName},\n\nSuite à votre demande de collaboration...\n\nCordialement`);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
  }
}

