import { InjectRedis } from '@liaoliaots/nestjs-redis';
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
  protected readonly channels_map: IChannelsMap = {};

  constructor(@InjectRedis('subscriber') protected readonly redis: Redis) {}

  onModuleInit() {
    this.redis.on('one', (data) => {
      console.log(data);
    });
  }

  public get_stream(id: string): Subject<any> {
    return this.channels_map[id].stream;
  }

  public async viewer_joined(id: string): Promise<void> {
    if (!this.channels_map[id]) {
      this.channels_map[id] = {
        count: 1,
        stream: new Subject(),
      };
      this.redis.subscribe(id);

      this.redis.on('one', (channel, data) => {
        console.log('MESSAGE', channel, data);
      });
    }
  }

  public async viewer_left(id: string): Promise<void> {
    console.log(this.channels_map);

    this.channels_map[id].count--;

    if (this.channels_map?.[id]?.count <= 0) {
      this.redis.unsubscribe(id);
      delete this.channels_map[id];
    }
  }
}
