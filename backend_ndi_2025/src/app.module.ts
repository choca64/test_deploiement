import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarteTalentsModule } from './defis/carte-talents/carte-talents.module';
import { AuthModule } from './auth/auth.module';
import { MessagingModule } from './defis/messaging/messaging.module';

@Module({
  imports: [CarteTalentsModule, AuthModule, MessagingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
