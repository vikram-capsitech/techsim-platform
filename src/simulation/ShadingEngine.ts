export type ShardingStrategy = 'range' | 'hash' | 'consistent_hash' | 'directory';

export interface ShardNode {
  id: string;
  name: string;
  rangeStart?: number;
  rangeEnd?: number;
  keyCount: number;
  loadPercent: number;
  isHot: boolean;
}

export interface DataKey {
  id: string;
  key: string;
  value: number;
  assignedShard: string;
  isHot: boolean;
}

export class ShardingEngine {
  private shards: ShardNode[] = [];
  private keys: DataKey[] = [];
  private strategy: ShardingStrategy = 'hash';
  private nextShardId = 1;
  private nextKeyId = 1;

  setStrategy(strategy: ShardingStrategy): void {
    this.strategy = strategy;
    this.redistribute();
  }

  addShard(name: string): void {
    this.shards.push({
      id: `shard_${this.nextShardId++}`,
      name,
      keyCount: 0,
      loadPercent: 0,
      isHot: false,
    });
    this.redistribute();
  }

  removeShard(id: string): void {
    this.shards = this.shards.filter((shard) => shard.id !== id);
    this.redistribute();
  }

  addKey(key: string): void {
    const value = this.hashString(key);
    this.keys.push({
      id: `key_${this.nextKeyId++}`,
      key,
      value,
      assignedShard: '',
      isHot: false,
    });
    this.redistribute();
  }

  addHotspotKeys(): void {
    const hotKey = 'user:viral_post';
    for (let i = 0; i < 20; i += 1) {
      this.addKey(`${hotKey}_${i}`);
    }
  }

  getState(): { shards: ShardNode[]; keys: DataKey[]; strategy: ShardingStrategy } {
    return {
      shards: this.shards.map((shard) => ({ ...shard })),
      keys: this.keys.map((key) => ({ ...key })),
      strategy: this.strategy,
    };
  }

  getRemapCount(prevKeys: DataKey[]): number {
    return this.keys.filter((key) => {
      const prev = prevKeys.find((prevKey) => prevKey.id === key.id);
      return prev && prev.assignedShard !== key.assignedShard;
    }).length;
  }

  private hashString(s: string): number {
    let h = 5381;
    for (let i = 0; i < s.length; i += 1) {
      h = ((h << 5) + h) + s.charCodeAt(i);
      h &= 0xffffffff;
    }
    return Math.abs(h);
  }

  private redistribute(): void {
    if (this.shards.length === 0) {
      this.keys.forEach((key) => {
        key.assignedShard = '';
        key.isHot = false;
      });
      return;
    }

    switch (this.strategy) {
      case 'hash':
        this.assignByHash();
        break;
      case 'range':
        this.assignByRange();
        break;
      case 'consistent_hash':
        this.assignByConsistentHash();
        break;
      case 'directory':
        this.assignByDirectory();
        break;
    }

    this.updateShardLoadStats();
  }

  private assignByHash(): void {
    this.keys.forEach((key) => {
      const idx = this.hashString(key.key) % this.shards.length;
      key.assignedShard = this.shards[idx].id;
    });
  }

  private assignByRange(): void {
    const rangeSize = 1_000_000 / this.shards.length;
    this.shards.forEach((shard, i) => {
      shard.rangeStart = i * rangeSize;
      shard.rangeEnd = (i + 1) * rangeSize;
    });

    this.keys.forEach((key) => {
      const normalizedValue = key.value % 1_000_000;
      const shard = this.shards.find((candidate) => {
        const start = candidate.rangeStart ?? 0;
        const end = candidate.rangeEnd ?? 1_000_000;
        return normalizedValue >= start && normalizedValue < end;
      }) ?? this.shards[this.shards.length - 1];
      key.assignedShard = shard.id;
    });
  }

  private assignByConsistentHash(): void {
    const virtualNodes = 150;
    const ring: Array<{ pos: number; shardId: string }> = [];

    this.shards.forEach((shard) => {
      for (let v = 0; v < virtualNodes; v += 1) {
        ring.push({
          pos: this.hashString(`${shard.id}_${v}`) % 360,
          shardId: shard.id,
        });
      }
    });
    ring.sort((a, b) => a.pos - b.pos);

    this.keys.forEach((key) => {
      const keyPos = this.hashString(key.key) % 360;
      const node = ring.find((ringNode) => ringNode.pos >= keyPos) ?? ring[0];
      key.assignedShard = node.shardId;
    });
  }

  private assignByDirectory(): void {
    const directory = new Map<string, string>();

    this.keys.forEach((key) => {
      const directoryKey = key.key.split(':')[0] || key.key;
      const existingShardId = directory.get(directoryKey);
      if (existingShardId) {
        key.assignedShard = existingShardId;
        return;
      }

      const leastLoadedShard = [...this.shards].sort((a, b) => a.keyCount - b.keyCount)[0];
      directory.set(directoryKey, leastLoadedShard.id);
      key.assignedShard = leastLoadedShard.id;
      leastLoadedShard.keyCount += 1;
    });
  }

  private updateShardLoadStats(): void {
    this.shards.forEach((shard) => {
      shard.keyCount = this.keys.filter((key) => key.assignedShard === shard.id).length;
      shard.loadPercent = this.keys.length > 0
        ? Math.round((shard.keyCount / this.keys.length) * 100)
        : 0;
      shard.isHot = shard.loadPercent > 40;
    });

    this.keys.forEach((key) => {
      const shard = this.shards.find((candidate) => candidate.id === key.assignedShard);
      key.isHot = shard?.isHot ?? false;
    });
  }
}
