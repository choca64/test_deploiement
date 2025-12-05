import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../carte-talents/services/supabase.service';
import { Message, Conversation, CreateMessageDirectDto } from '../model/message.dto';

@Injectable()
export class MessagingService {
  constructor(private supabase: SupabaseService) {}

  /**
   * Obtenir ou créer une conversation
   * userId2 peut être un vrai userId ou "talent_XXX" pour les talents sans compte
   */
  async getOrCreateConversation(userId1: string, userId2: string, talentId?: string): Promise<string> {
    console.log('💬 [MESSAGING] Recherche/création conversation');
    console.log('   - From:', userId1);
    console.log('   - To:', userId2);
    console.log('   - TalentId:', talentId);

    const client = this.supabase.getClient();
    const isTalentOnly = userId2.startsWith('talent_');

    // Si c'est une conversation avec un talent (sans compte utilisateur)
    // On cherche par talent_id
    if (isTalentOnly && talentId) {
      const { data: existingConv } = await client
        .from('conversations')
        .select('id')
        .eq('talent_id', talentId)
        .single();

      if (existingConv) {
        // Vérifier que l'utilisateur est participant
        const { data: isParticipant } = await client
          .from('conversation_participants')
          .select('id')
          .eq('conversation_id', existingConv.id)
          .eq('user_id', userId1)
          .single();

        if (isParticipant) {
          console.log('✅ [MESSAGING] Conversation talent existante:', existingConv.id);
          return existingConv.id;
        }
      }
    } else {
      // Conversation entre deux utilisateurs - chercher par participants
      const { data: existingConvs } = await client
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', userId1);

      if (existingConvs && existingConvs.length > 0) {
        for (const conv of existingConvs) {
          const { data: otherParticipant } = await client
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conv.conversation_id)
            .eq('user_id', userId2)
            .single();

          if (otherParticipant) {
            console.log('✅ [MESSAGING] Conversation existante:', conv.conversation_id);
            return conv.conversation_id;
          }
        }
      }
    }

    // Créer une nouvelle conversation
    console.log('📝 [MESSAGING] Création nouvelle conversation...');
    const { data: newConv, error: convError } = await client
      .from('conversations')
      .insert({
        talent_id: talentId || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (convError) {
      console.error('❌ [MESSAGING] Erreur création conversation:', convError);
      throw convError;
    }

    console.log('✅ [MESSAGING] Conversation créée:', newConv.id);

    // Ajouter les participants
    const participants: { conversation_id: string; user_id: string }[] = [
      { conversation_id: newConv.id, user_id: userId1 }
    ];

    // N'ajouter le deuxième participant que si c'est un vrai userId
    if (!isTalentOnly) {
      participants.push({ conversation_id: newConv.id, user_id: userId2 });
    }

    const { error: partError } = await client
      .from('conversation_participants')
      .insert(participants);

    if (partError) {
      console.error('❌ [MESSAGING] Erreur ajout participants:', partError);
      throw partError;
    }

    console.log('✅ [MESSAGING] Participants ajoutés');
    console.log('✨ [MESSAGING] Nouvelle conversation créée:', newConv.id);
    return newConv.id;
  }

  /**
   * Envoyer un message dans une conversation
   */
  async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
    console.log('📤 [MESSAGING] Envoi message dans conversation', conversationId);

    const client = this.supabase.getClient();

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: participant } = await client
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', senderId)
      .single();

    if (!participant) {
      throw new ForbiddenException('Vous ne faites pas partie de cette conversation');
    }

    // Récupérer les infos de l'expéditeur
    const { data: sender } = await client
      .from('users')
      .select('username, display_name, avatar_color')
      .eq('id', senderId)
      .single();

    // Créer le message
    const { data: message, error } = await client
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_name: sender?.display_name || sender?.username || 'Utilisateur',
        sender_avatar_color: sender?.avatar_color || '#3DB4AD',
        content: content,
        is_read: false
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [MESSAGING] Erreur envoi message:', error);
      throw error;
    }

    // Mettre à jour la date de la conversation
    await client
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);

    console.log('✅ [MESSAGING] Message envoyé:', message.id);
    return message;
  }

  /**
   * Envoyer un message direct à un utilisateur (créer la conv si nécessaire)
   */
  async sendDirectMessage(fromUserId: string, dto: CreateMessageDirectDto): Promise<{ conversation: string; message: Message }> {
    console.log('📨 [MESSAGING] Message direct vers', dto.toUserId);

    const conversationId = await this.getOrCreateConversation(fromUserId, dto.toUserId, dto.talentId);
    const message = await this.sendMessage(conversationId, fromUserId, dto.content);

    return { conversation: conversationId, message };
  }

  /**
   * Obtenir les conversations d'un utilisateur
   */
  async getUserConversations(userId: string): Promise<Conversation[]> {
    console.log('📋 [MESSAGING] Récupération conversations pour', userId);

    const client = this.supabase.getClient();

    // Récupérer les IDs des conversations
    const { data: participations } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!participations || participations.length === 0) {
      return [];
    }

    const convIds = participations.map(p => p.conversation_id);

    // Récupérer les conversations avec leurs détails
    const { data: conversations } = await client
      .from('conversations')
      .select('*')
      .in('id', convIds)
      .order('updated_at', { ascending: false });

    if (!conversations) return [];

    // Enrichir avec participants et dernier message
    const enriched: Conversation[] = [];

    for (const conv of conversations) {
      // Participants
      const { data: parts } = await client
        .from('conversation_participants')
        .select(`
          user_id,
          joined_at,
          users!inner(username, display_name, avatar_color)
        `)
        .eq('conversation_id', conv.id);

      // Dernier message
      const { data: lastMsg } = await client
        .from('messages')
        .select('*')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Messages non lus
      const { count: unreadCount } = await client
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      // Nom du talent si lié
      let talentName: string | undefined = undefined;
      if (conv.talent_id) {
        const { data: talent } = await client
          .from('talents')
          .select('nom')
          .eq('id', conv.talent_id)
          .single();
        talentName = talent?.nom || undefined;
      }

      enriched.push({
        id: conv.id,
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        talent_id: conv.talent_id,
        talent_name: talentName,
        participants: (parts || []).map((p: any) => ({
          user_id: p.user_id,
          username: p.users?.username || 'Unknown',
          display_name: p.users?.display_name || p.users?.username || 'Unknown',
          avatar_color: p.users?.avatar_color || '#3DB4AD',
          joined_at: p.joined_at
        })),
        last_message: lastMsg || undefined,
        unread_count: unreadCount || 0
      });
    }

    console.log('✅ [MESSAGING]', enriched.length, 'conversations trouvées');
    return enriched;
  }

  /**
   * Obtenir les messages d'une conversation
   */
  async getConversationMessages(conversationId: string, userId: string): Promise<Message[]> {
    console.log('📜 [MESSAGING] Récupération messages conversation', conversationId);

    const client = this.supabase.getClient();

    // Vérifier que l'utilisateur fait partie de la conversation
    const { data: participant } = await client
      .from('conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', userId)
      .single();

    if (!participant) {
      throw new ForbiddenException('Vous ne faites pas partie de cette conversation');
    }

    // Récupérer les messages
    const { data: messages, error } = await client
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ [MESSAGING] Erreur récupération messages:', error);
      throw error;
    }

    // Marquer les messages comme lus
    await client
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);

    console.log('✅ [MESSAGING]', messages?.length || 0, 'messages récupérés');
    return messages || [];
  }

  /**
   * Compter les messages non lus
   */
  async getUnreadCount(userId: string): Promise<number> {
    const client = this.supabase.getClient();

    // Récupérer les conversations de l'utilisateur
    const { data: participations } = await client
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!participations || participations.length === 0) return 0;

    const convIds = participations.map(p => p.conversation_id);

    const { count } = await client
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', convIds)
      .eq('is_read', false)
      .neq('sender_id', userId);

    return count || 0;
  }
}

