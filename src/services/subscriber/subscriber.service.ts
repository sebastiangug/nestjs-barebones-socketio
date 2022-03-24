import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BehaviorSubject } from 'rxjs';

export interface IChannelsMap {
  [key: string]: {
    count: number;
    stream: BehaviorSubject<any>;
    viewers: number;
  };
}

@Injectable()
export class SubscriberService implements OnModuleInit {
  protected readonly channels_map: IChannelsMap = {};

  constructor(@InjectRedis('subscriber') protected readonly redis: Redis) {}

  onModuleInit() {
    this.redis.on('message', (channel, data) => {
      this.channels_map?.[channel]?.stream.next(JSON.parse(data));
    });
  }

  public get_stream(id: string): BehaviorSubject<any> {
    return this.channels_map[id].stream;
  }

  public async viewer_joined(id: string): Promise<void> {
    if (!this.channels_map[id]) {
      this.channels_map[id] = {
        count: 0,
        stream: new BehaviorSubject(null),
        viewers: 0,
      };
      await this.redis.subscribe(id);
      const cache_views = () => {
        setTimeout(async () => {
          if (this.channels_map[id]) {
            this.channels_map[id].viewers = await this._get_viewer_count(id);
            cache_views();
          }
        }, 4999);
      };
    }

    this.channels_map[id].count++;
  }

  public async viewer_left(id: string): Promise<void> {
    this.channels_map?.[id]?.count ? this.channels_map[id].count-- : '';

    if (this.channels_map?.[id]?.count <= 0) {
      this.redis.unsubscribe(id);
      delete this.channels_map[id];
    }
  }

  public async get_viewer_count(id: string) {
    return this.channels_map[id].viewers;
  }

  private async _get_viewer_count(id: string): Promise<number> {
    const res = await this.redis.zcount(id, 0, 100);

    return res;
  }
}
