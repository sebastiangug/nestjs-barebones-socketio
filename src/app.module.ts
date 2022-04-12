import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { LiveGateway } from './live.gateway';

@Module({
  controllers: [AppController],
  providers: [LiveGateway],
})
export class AppModule {}
