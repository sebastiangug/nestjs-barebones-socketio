import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class PublisherService implements OnModuleInit {
  constructor(@InjectRedis('publisher') protected readonly redis: Redis) {}

  onModuleInit() {
    const emit_1 = () => {
      setTimeout(() => {
        this.redis.publish('one', 'channel one publishing');
        emit_1();
      }, 2500);
    };

    emit_1();

    const emit_2 = () => {
      setTimeout(() => {
        this.redis.publish('two', 'channel two publishing');
        emit_2();
      }, 2500);
    };

    emit_2();

    const emit_3 = () => {
      setTimeout(() => {
        this.redis.publish('three', 'channel three publishing');
        emit_4();
      }, 2500);
    };

    emit_3();

    const emit_4 = () => {
      setTimeout(() => {
        this.redis.publish('four', 'channel four publishing');
        emit_4();
      }, 2500);
    };

    emit_4();
  }
}
