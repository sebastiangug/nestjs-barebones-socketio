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

    this.redis.hdel('one', 'viewers');
  }

  public add_donation(id: string, donation: number) {
    this.redis.hincrby(id, 'donations', donation).then((value) => {
      this.redis.publish(id, JSON.stringify({ donations: value }));
    });
  }

  public async add_viewer(channel: string, id: string) {
    this.redis.set(id, '');
    this.redis.expire(id, 300);
    this.redis.zadd(channel + '_viewers', 0, id);
  }

  public async remove_viewer(id: string) {
    this.redis.del(id);
  }
}
