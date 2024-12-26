import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  async rpush(key: string, ...members: string[]): Promise<number> {
    return await this.redis.rpush(key, ...members);
  }
  async hset(key: string, field: string, value: string) {
    return await this.redis.hset(key, field, value);
  }
  async smembers(key: string): Promise<string[]> {
    return await this.redis.smembers(key);
  }
  async hGetAll(key: string) {
    return await this.redis.hgetall(key);
  }
  async hDel(key: string, field: string) {
    return await this.redis.hdel(key, field);
  }
  async hGet(key: string, field: string) {
    return await this.redis.hget(key, field);
  }
  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1; // Redis возвращает 1, если элемент найден, и 0, если нет
    } catch (error) {
      console.error('Error checking if member exists in Redis:', error);
      throw new Error('Error checking member in Redis');
    }
  }
  async isMember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.redis.sismember(key, member);
      return result === 1; // Redis возвращает 1, если элемент найден, и 0, если нет
    } catch (error) {
      console.error('Error checking if member exists in Redis:', error);
      throw new Error('Error checking member in Redis');
    }
  }
  async del(key: string) {
    return await this.redis.del(key);
  }
  // Другие методы для работы с Redis, например, для добавления элемента в множество
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      // Используем команду SADD для добавления элементов в множество
      const result = await this.redis.sadd(key, ...members);
      return result; // Возвращает количество добавленных элементов
    } catch (error) {
      console.error('Error adding members to Redis set:', error);
      throw new Error('Error adding members to Redis set');
    }
  }
  async lrange(key: string, start: number, end: number): Promise<string[]> {
    const members = await this.redis.lrange(key, start, end);
    return members;
  }
  async addObjectMemeber(key: string, member: string): Promise<void> {
    await this.redis.rpush(key, member);
  }
  async addMember(key: string, member: string[]): Promise<void> {
    await this.redis.sadd(key, member);
  }
  async removeMember(key: string, member: string): Promise<void> {
    await this.redis.srem(key, member);
  }
  async getMembers(key: string): Promise<string[]> {
    const members = await this.redis.smembers(key);
    return members;
  }
  async getValue(key: string): Promise<string> {
    const post = await this.redis.get(key);
    return post;
  }

  async setValue(key: string, value: string, ttl: number) {
    return await this.redis.set(key, value, 'EX', ttl); // 'EX' — время жизни в секундах
  }

  async incrementValue(key: string): Promise<number> {
    return await this.redis.incr(key);
  }
  async decrementValue(key: string): Promise<number> {
    return await this.redis.decr(key);
  }

  async deleteValue(key: string) {
    return await this.redis.del(key);
  }
  async getKeys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }
  async deleteKeys(keys: string[]) {
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
  async delayIncrement(key: string, delay: number) {
    setTimeout(async () => {
      await this.incrementValue(key);
    }, delay);
  }
}
