import { InjectRedis, RedisService } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { Subject } from 'rxjs';

export interface IChannelsMap {
  [key: string]: {
    count: number;
    stream: Subject<any>;
  };
}

@Injectable()
export class SubscriberService implements OnModuleInit {
  protected readonly channels_map = {};

  constructor(@InjectRedis('subscriber') protected readonly redis: Redis) {}

  onModuleInit() {
    const subscription = this.get_stream('one').subscribe((update) => {
      console.log('UPDATE COMING');
    });
  }

  public get_stream(id: string): Subject<any> {
    return this.channels_map[id];
  }

  public async viewer_joined(id: string): Promise<void> {
    if (!this.channels_map[id]) {
      this.channels_map[id] = {
        count: 1,
        stream: new Subject(),
      };
      this.redis.psubscribe(id);
    }
  }

  public async viewer_left(id: string): Promise<void> {
    this.channels_map[id].count--;

    if (this.channels_map[id].count <= 0) {
      this.redis.punsubscribe(id);
      delete this.channels_map[id];
    }
  }
}
