import { Body, Controller, Get, Param, Post, Headers, UnauthorizedException } from '@nestjs/common';
import { MessagingService } from '../services/messaging.service';
import { SendMessageDto, CreateMessageDirectDto } from '../model/message.dto';
import * as jwt from 'jsonwebtoken';

// Même secret que dans auth.service.ts
const JWT_SECRET = process.env.JWT_SECRET || 'ndi2025_super_secret_key_change_in_production';

@Controller('api/messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  /**
   * Extraire l'ID utilisateur du token JWT
   */
  private getUserIdFromToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ [MSG API] Token manquant');
      throw new UnauthorizedException('Token manquant');
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      console.log('✅ [MSG API] Token validé, userId:', decoded.sub || decoded.userId);
      return decoded.sub || decoded.userId;
    } catch (error) {
      console.log('❌ [MSG API] Token invalide:', error);
      throw new UnauthorizedException('Token invalide');
    }
  }

  /**
   * Obtenir toutes les conversations de l'utilisateur connecté
   */
  @Get('conversations')
  async getConversations(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    return this.messagingService.getUserConversations(userId);
  }

  /**
   * Obtenir les messages d'une conversation
   */
  @Get('conversations/:id')
  async getMessages(
    @Param('id') conversationId: string,
    @Headers('authorization') auth: string
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.messagingService.getConversationMessages(conversationId, userId);
  }

  /**
   * Envoyer un message dans une conversation existante
   */
  @Post('send')
  async sendMessage(
    @Body() dto: SendMessageDto,
    @Headers('authorization') auth: string
  ) {
    const userId = this.getUserIdFromToken(auth);
    return this.messagingService.sendMessage(dto.conversationId, userId, dto.content);
  }

  /**
   * Envoyer un message direct à un utilisateur (crée la conversation si nécessaire)
   */
  @Post('direct')
  async sendDirectMessage(
    @Body() dto: CreateMessageDirectDto,
    @Headers('authorization') auth: string
  ) {
    console.log('📨 [API] POST /api/messages/direct');
    console.log('   - Body:', JSON.stringify(dto));
    
    try {
      const userId = this.getUserIdFromToken(auth);
      console.log('   - FromUserId:', userId);
      
      const result = await this.messagingService.sendDirectMessage(userId, dto);
      console.log('✅ [API] Message envoyé avec succès');
      return result;
    } catch (error) {
      console.error('❌ [API] Erreur:', error);
      throw error;
    }
  }

  /**
   * Obtenir le nombre de messages non lus
   */
  @Get('unread-count')
  async getUnreadCount(@Headers('authorization') auth: string) {
    const userId = this.getUserIdFromToken(auth);
    const count = await this.messagingService.getUnreadCount(userId);
    return { count };
  }
}

