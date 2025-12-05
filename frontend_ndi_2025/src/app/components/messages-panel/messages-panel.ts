import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagingService, Conversation, Message } from '../../services/messaging.service';
import { AuthService, User } from '../../auth/services/auth.service';

@Component({
  selector: 'app-messages-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './messages-panel.html',
  styleUrls: ['./messages-panel.css']
})
export class MessagesPanel implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  isOpen = false;
  isPanelMinimized = false;
  
  conversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  messages: Message[] = [];
  currentUser: User | null = null;
  isLoggedIn = false;
  
  unreadCount = 0;
  newMessage = '';
  isLoading = false;
  isSending = false;
  
  private subs: Subscription[] = [];
  private shouldScrollToBottom = false;
  private pollingInterval: any = null;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.subs.push(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;
        if (user) {
          this.loadConversations();
          this.startPolling();
        } else {
          this.stopPolling();
        }
      }),
      this.messagingService.conversations$.subscribe(convs => {
        this.conversations = convs;
      }),
      this.messagingService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
      }),
      this.messagingService.currentMessages$.subscribe(msgs => {
        this.messages = msgs;
        this.shouldScrollToBottom = true;
      })
    );
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.stopPolling();
  }

  private startPolling() {
    this.stopPolling();
    this.pollingInterval = setInterval(() => {
      if (this.isOpen && this.currentConversation) {
        this.messagingService.loadMessages(this.currentConversation.id);
      }
      this.messagingService.loadUnreadCount();
    }, 5000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  togglePanel() {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.isLoggedIn) {
      this.loadConversations();
    }
  }

  closePanel() {
    this.isOpen = false;
    this.currentConversation = null;
  }

  minimizePanel() {
    this.isPanelMinimized = !this.isPanelMinimized;
  }

  async loadConversations() {
    this.isLoading = true;
    await this.messagingService.loadConversations();
    this.isLoading = false;
  }

  async selectConversation(conv: Conversation) {
    this.currentConversation = conv;
    this.isLoading = true;
    await this.messagingService.loadMessages(conv.id);
    this.isLoading = false;
  }

  backToList() {
    this.currentConversation = null;
    this.loadConversations();
  }

  async sendMessage() {
    if (!this.newMessage.trim() || !this.currentConversation || this.isSending) return;

    this.isSending = true;
    const content = this.newMessage;
    this.newMessage = '';

    await this.messagingService.sendMessage(this.currentConversation.id, content);
    this.isSending = false;
    this.shouldScrollToBottom = true;
  }

  getOtherParticipant(conv: Conversation) {
    return this.messagingService.getOtherParticipant(conv);
  }

  isOwnMessage(message: Message): boolean {
    return message.sender_id === this.currentUser?.id;
  }

  formatTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'À l\'instant';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}min`;
    if (diff < 86400000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  }

  private scrollToBottom() {
    if (this.messagesContainer) {
      const el = this.messagesContainer.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  handleKeypress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}

