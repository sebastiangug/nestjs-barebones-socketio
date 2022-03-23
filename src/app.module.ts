import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SubscriberService } from './services/subscriber/subscriber.service';
import { PublisherService } from './services/publisher/publisher.service';

@Module({
  imports: [
    RedisModule.forRoot({
      config: {
        host: 'localhost',
        port: 6379,
      },
    }),
  ],
  controllers: [AppController],
  providers: [SubscriberService, PublisherService],
})
export class AppModule {}
