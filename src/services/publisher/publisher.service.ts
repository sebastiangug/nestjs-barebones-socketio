import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class PublisherService implements OnModuleInit {
  constructor(@InjectRedis('publisher') protected readonly redis: Redis) {}

  async onModuleInit() {
    this.redis.on('ready', () => {
      this.redis.config('SET', 'notify-keyspace-events', 'Ex');
    });

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

    this.redis.zcount('1231231123', 0, 100).then((res) => {
      console.log('ZCOUNT RES', res);
    });

    await this.redis.hset('potato', ['something', 1, 'potato', 2]);

    const hash = await this.redis.hget('potato', 'asdadass');

    console.log('HASH GOTTEN FROM HGET', hash);
  }

  public add_donation(id: string, donation: number) {
    this.redis.hincrby(id, 'donations', donation).then((value) => {
      this.redis.publish(id, JSON.stringify({ donations: value }));
    });
  }

  public async add_viewer(channel: string, id: string) {
    // setting the viewer key
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
