import { Module } from '@nestjs/common';
import { MessagingController } from './controller/messaging.controller';
import { MessagingService } from './services/messaging.service';
import { SupabaseService } from '../carte-talents/services/supabase.service';

@Module({
  controllers: [MessagingController],
  providers: [MessagingService, SupabaseService],
  exports: [MessagingService]
})
export class MessagingModule {}

