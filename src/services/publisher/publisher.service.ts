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

    this.redis.on('*', (data) => {
      console.log('DATA EXPIRED ON KEY', data);
    });

    this.redis.config('SET', 'notify-keyspace-events', 'Ex');
  }

  public add_donation(id: string, donation: number) {
    this.redis.hincrby(id, 'donations', donation).then((value) => {
      this.redis.publish(id, JSON.stringify({ donations: value }));
    });
  }

  public async add_viewer(channel: string, id: string) {
    this.redis.set(id, '');
    this.redis.expire(id, 100);
    this.redis.zadd(channel + '_viewers', 0, id);
  }

  public async remove_viewer(channel: string, id: string) {
    this.redis.unlink(id);
    this.redis.zrem(channel + '_viewers', id);
  }

  public async maintain_connection(id: string): Promise<void> {
    this.redis.expire(id, 100);
  }

  public async get_viewer_count_master(channel: string): Promise<number> {
    return await this.redis.zcount(channel + '_viewers', 0, 100);
  }
}
