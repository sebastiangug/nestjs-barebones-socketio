import { Controller, Get } from '@nestjs/common';
import { PublisherService } from './services/publisher/publisher.service';
import { SubscriberService } from './services/subscriber/subscriber.service';

@Controller()
export class AppController {
  constructor(
    private readonly subscriberService: SubscriberService,
    private readonly publisherService: PublisherService,
  ) {}

  @Get()
  getHello(): string {
    return;
  }
}
