import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, firstValueFrom, interval } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { environment } from '../../environments/environment';

const API_URL = environment.apiUrl + '/api/messages';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar_color: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface ConversationParticipant {
  user_id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  joined_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  talent_id?: string;
  talent_name?: string;
  participants: ConversationParticipant[];
  last_message?: Message;
  unread_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private currentConversationSubject = new BehaviorSubject<Message[]>([]);

  conversations$ = this.conversationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();
  currentMessages$ = this.currentConversationSubject.asObservable();

  private pollingInterval: any = null;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Démarrer le polling si connecté
    this.authService.isAuthenticated$.subscribe(isAuth => {
      if (isAuth) {
        this.startPolling();
      } else {
        this.stopPolling();
      }
    });
  }

  /**
   * Démarrer le polling pour les nouveaux messages
   */
  private startPolling() {
    this.loadConversations();
    this.loadUnreadCount();

    // Polling toutes les 10 secondes
    this.pollingInterval = setInterval(() => {
      this.loadUnreadCount();
    }, 10000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Charger les conversations
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const conversations = await firstValueFrom(
        this.http.get<Conversation[]>(`${API_URL}/conversations`, {
          headers: this.authService.getAuthHeaders()
        })
      );
      this.conversationsSubject.next(conversations);
      console.log('💬 [MSG] Conversations chargées:', conversations.length);
      return conversations;
    } catch (error) {
      console.error('❌ [MSG] Erreur chargement conversations:', error);
      return [];
    }
  }

  /**
   * Charger les messages d'une conversation
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const messages = await firstValueFrom(
        this.http.get<Message[]>(`${API_URL}/conversations/${conversationId}`, {
          headers: this.authService.getAuthHeaders()
        })
      );
      this.currentConversationSubject.next(messages);
      console.log('📜 [MSG] Messages chargés:', messages.length);
      
      // Rafraîchir le compteur
      this.loadUnreadCount();
      
      return messages;
    } catch (error) {
      console.error('❌ [MSG] Erreur chargement messages:', error);
      return [];
    }
  }

  /**
   * Envoyer un message dans une conversation
   */
  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    try {
      const message = await firstValueFrom(
        this.http.post<Message>(`${API_URL}/send`, 
          { conversationId, content },
          { headers: this.authService.getAuthHeaders() }
        )
      );
      
      // Ajouter le message à la liste actuelle
      const current = this.currentConversationSubject.value;
      this.currentConversationSubject.next([...current, message]);
      
      // Rafraîchir les conversations
      this.loadConversations();
      
      console.log('✅ [MSG] Message envoyé');
      return message;
    } catch (error) {
      console.error('❌ [MSG] Erreur envoi message:', error);
      return null;
    }
  }

  /**
   * Envoyer un message direct à un utilisateur
   */
  async sendDirectMessage(toUserId: string, content: string, talentId?: string): Promise<{ conversation: string; message: Message } | null> {
    console.log('📨 [MSG] sendDirectMessage appelé');
    console.log('   - toUserId:', toUserId);
    console.log('   - talentId:', talentId);
    console.log('   - content:', content.substring(0, 50) + '...');
    console.log('   - API URL:', `${API_URL}/direct`);
    console.log('   - Headers:', this.authService.getAuthHeaders());
    
    try {
      const result = await firstValueFrom(
        this.http.post<{ conversation: string; message: Message }>(`${API_URL}/direct`,
          { toUserId, content, talentId },
          { headers: this.authService.getAuthHeaders() }
        )
      );
      
      console.log('✅ [MSG] Message direct envoyé, résultat:', result);
      this.loadConversations();
      
      return result;
    } catch (error: any) {
      console.error('❌ [MSG] Erreur envoi message direct:', error);
      console.error('   - Status:', error?.status);
      console.error('   - Message:', error?.error?.message || error?.message);
      return null;
    }
  }

  /**
   * Charger le nombre de messages non lus
   */
  async loadUnreadCount(): Promise<number> {
    try {
      const result = await firstValueFrom(
        this.http.get<{ count: number }>(`${API_URL}/unread-count`, {
          headers: this.authService.getAuthHeaders()
        })
      );
      this.unreadCountSubject.next(result.count);
      return result.count;
    } catch (error) {
      return 0;
    }
  }

  /**
   * Obtenir l'autre participant d'une conversation (pas l'utilisateur actuel)
   */
  getOtherParticipant(conversation: Conversation): ConversationParticipant | null {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return null;

    return conversation.participants.find(p => p.user_id !== currentUser.id) || null;
  }
}

