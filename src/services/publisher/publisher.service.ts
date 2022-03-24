import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class PublisherService implements OnModuleInit {
  constructor(@InjectRedis('publisher') protected readonly redis: Redis) {}

  onModuleInit() {
    this.redis.hgetall('one', (err, res) => {
      console.log('one', res);
    });

    this.redis.hgetall('two', (err, res) => {
      console.log('two', res);
    });

    this.redis.hgetall('three', (err, res) => {
      console.log('three', res);
    });

    this.redis.hgetall('four', (err, res) => {
      console.log('four', res);
    });
  }

  public add_donation(id: string, donation: number) {
    this.redis.hset(id, ['donations']);
    this.redis.publish(id, JSON.stringify({ donation }));
  }

  public async add_viewer(id: string) {
    this.redis.hincrby(id, 'viewers', 1).then((value) => {
      console.log(value);
    });
  }

  public async remove_viewer(id: string) {
    this.redis.hincrby(id, 'viewers', -1).then((value) => {
      console.log(value);
    });
  }
}
