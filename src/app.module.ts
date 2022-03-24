import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { SubscriberService } from './services/subscriber/subscriber.service';
import { PublisherService } from './services/publisher/publisher.service';
import { LiveGateway } from './live.gateway';

@Module({
  imports: [
    RedisModule.forRoot({
      config: [
        {
          host: 'localhost',
          port: 6379,
          namespace: 'subscriber',
        },
        {
          host: 'localhost',
          port: 6379,
          namespace: 'publisher',
        },
      ],
    }),
  ],
  controllers: [AppController],
  providers: [SubscriberService, PublisherService, LiveGateway],
})
export class AppModule {}
