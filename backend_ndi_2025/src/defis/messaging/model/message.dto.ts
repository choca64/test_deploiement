/**
 * DTOs pour le système de messagerie
 */

export class CreateConversationDto {
  participantIds: string[];
  talentId?: string; // Si la conversation est liée à un talent
  initialMessage?: string;
}

export class SendMessageDto {
  conversationId: string;
  content: string;
}

export class CreateMessageDirectDto {
  toUserId: string;
  content: string;
  talentId?: string; // Contexte du talent concerné
  projectType?: string;
}

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

export interface ConversationParticipant {
  user_id: string;
  username: string;
  display_name: string;
  avatar_color: string;
  joined_at: string;
}

