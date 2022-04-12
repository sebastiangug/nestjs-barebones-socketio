import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';
import { BehaviorSubject } from 'rxjs';
import { PublisherService } from '../publisher/publisher.service';

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

  constructor(
    @InjectRedis('subscriber') protected readonly redis: Redis,
    protected readonly publisherService: PublisherService,
  ) {}

  onModuleInit() {
    this.redis.subscribe('__keyevent@0__:expired');

    this.redis.on('message', (arg1, arg2) => {
      console.log('NOTIFICATION', arg1, arg2);

      if ((arg2 as string).endsWith(':viewer')) {
        const viewerKey = arg2.split(':');

        this.publisherService.remove_viewer(viewerKey[1], arg2);
      }

      this.channels_map?.[arg1]?.stream.next(JSON.parse(arg2));
    });

    this.redis.on('*', (data) => {
      console.log('ON * FIRING', data);
    });

    this.redis.on('del', (data) => {
      console.log('ON del FIRING', data);
    });

    this.redis.on('*', (data) => {
      console.log('ON expire FIRING', data);
    });

    this.redis.on('*_viewer', (data) => {
      console.log('ON _viewer FIRING', data);
    });

    this.redis.on('expire', (data) => {
      console.log('DATA EXPIRED ON KEY', data);
    });

    this.redis.on('*', (data) => {
      console.log('STUFF happened', data);
    });
  }

  public get_stream(id: string): BehaviorSubject<any> {
    return this.channels_map[id].stream;
  }

  public async viewer_joined(channel: string): Promise<void> {
    if (!this.channels_map[channel]) {
      this.channels_map[channel] = {
        count: 0,
        stream: new BehaviorSubject(null),
        viewers: 0,
      };
      await this.redis.subscribe(channel);

      // caching the initial viewers count
      this.channels_map[channel].viewers =
        await this.publisherService.get_viewer_count_master(channel);

      const cache_views = () => {
        setTimeout(async () => {
          if (this.channels_map[channel]) {
            this.channels_map[channel].viewers =
              await this.publisherService.get_viewer_count_master(channel);

            cache_views();
          }
        }, 4999);
      };

      cache_views();
    }

    this.channels_map[channel].count++;
  }

  public async viewer_left(channel: string): Promise<void> {
    this.channels_map?.[channel]?.count
      ? this.channels_map[channel].count--
      : '';

    if (this.channels_map?.[channel]?.count <= 0) {
      this.redis.unsubscribe(channel);
      delete this.channels_map[channel];
    }
  }

  public async get_viewer_count(channel: string) {
    return this.channels_map[channel]?.viewers ?? 0;
  }
}
