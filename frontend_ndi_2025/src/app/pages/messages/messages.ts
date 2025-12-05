import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagingService, Conversation, Message } from '../../services/messaging.service';
import { AuthService, User } from '../../auth/services/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './messages.html',
  styleUrls: ['./messages.css']
})
export class MessagesPage implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  
  conversations: Conversation[] = [];
  currentConversation: Conversation | null = null;
  messages: Message[] = [];
  currentUser: User | null = null;
  
  newMessage = '';
  isLoading = false;
  isSending = false;
  
  private subs: Subscription[] = [];
  private shouldScrollToBottom = false;

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    
    this.subs.push(
      this.messagingService.conversations$.subscribe(convs => {
        this.conversations = convs;
      }),
      this.messagingService.currentMessages$.subscribe(msgs => {
        this.messages = msgs;
        this.shouldScrollToBottom = true;
      })
    );

    this.loadConversations();
  }

  ngAfterViewChecked() {
    if (this.shouldScrollToBottom) {
      this.scrollToBottom();
      this.shouldScrollToBottom = false;
    }
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
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
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
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

