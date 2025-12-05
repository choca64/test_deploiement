import { Module } from '@nestjs/common';
import { TalentsController } from './controller/talents.controller';
import { TalentsService } from './services/talents.service';
import { SupabaseService } from './services/supabase.service';

@Module({
  controllers: [TalentsController],
  providers: [TalentsService, SupabaseService],
  exports: [TalentsService, SupabaseService],
})
export class CarteTalentsModule {}

