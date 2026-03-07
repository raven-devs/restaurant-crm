import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [ConfigModule, SupabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
