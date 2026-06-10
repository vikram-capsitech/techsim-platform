export type ReplicationMode = 'sync' | 'async' | 'semi_sync';

export interface ReplicaNode {
  id: string;
  name: string;
  role: 'primary' | 'replica';
  lag: number;
  lastSyncedAt: number;
  isDown: boolean;
  data: Record<string, unknown>;
}

export interface WriteOperation {
  id: string;
  key: string;
  value: unknown;
  timestamp: number;
  syncedTo: string[];
  status: 'pending' | 'synced' | 'failed';
}

export interface ReplicationState {
  nodes: ReplicaNode[];
  writeLog: WriteOperation[];
  mode: ReplicationMode;
  lagMs: number;
}

export class ReplicationEngine {
  private nodes: ReplicaNode[] = [];
  private writeLog: WriteOperation[] = [];
  private mode: ReplicationMode = 'async';
  private lagMs = 200;
  private onUpdate: (state: ReplicationState) => void;
  private nextWriteId = 1;

  constructor(onUpdate: (state: ReplicationState) => void) {
    this.onUpdate = onUpdate;
    this.initializeNodes();
  }

  async write(key: string, value: unknown): Promise<{ success: boolean; lag: number }> {
    const primary = this.nodes.find((node) => node.role === 'primary');
    if (!primary || primary.isDown) {
      this.promoteReplica();
      return { success: false, lag: 0 };
    }

    const op: WriteOperation = {
      id: `write_${this.nextWriteId++}`,
      key,
      value,
      timestamp: Date.now(),
      syncedTo: ['primary'],
      status: 'pending',
    };

    primary.data[key] = value;
    this.writeLog.push(op);

    if (this.mode === 'sync') {
      await this.syncToReplicas(op, true);
      op.status = 'synced';
      this.onUpdate(this.getState());
      return {
        success: true,
        lag: this.lagMs * this.nodes.filter((node) => node.role === 'replica' && !node.isDown).length,
      };
    }

    if (this.mode === 'async') {
      op.status = 'synced';
      setTimeout(() => {
        void this.syncToReplicas(op, false);
      }, this.lagMs);
      this.onUpdate(this.getState());
      return { success: true, lag: 0 };
    }

    const firstReplica = this.nodes.find((node) => node.role === 'replica' && !node.isDown);
    if (firstReplica) {
      await new Promise((resolve) => {
        setTimeout(resolve, this.lagMs);
      });
      firstReplica.data[key] = value;
      firstReplica.lag = 0;
      firstReplica.lastSyncedAt = Date.now();
      op.syncedTo.push(firstReplica.id);
    }

    op.status = 'synced';
    setTimeout(() => {
      void this.syncToReplicas(op, false);
    }, this.lagMs);
    this.onUpdate(this.getState());
    return { success: true, lag: firstReplica ? this.lagMs : 0 };
  }

  killPrimary(): void {
    const primary = this.nodes.find((node) => node.role === 'primary');
    if (primary) {
      primary.isDown = true;
    }
    setTimeout(() => this.promoteReplica(), 2_000);
    this.onUpdate(this.getState());
  }

  promoteReplica(): void {
    const oldPrimary = this.nodes.find((node) => node.role === 'primary');
    const replica = this.nodes.find((node) => node.role === 'replica' && !node.isDown);

    if (oldPrimary) {
      oldPrimary.role = 'replica';
    }

    if (replica) {
      replica.role = 'primary';
      replica.lag = 0;
      replica.lastSyncedAt = Date.now();
    }

    this.onUpdate(this.getState());
  }

  setMode(mode: ReplicationMode): void {
    this.mode = mode;
    this.onUpdate(this.getState());
  }

  setLag(ms: number): void {
    this.lagMs = Math.max(0, ms);
    this.nodes
      .filter((node) => node.role === 'replica')
      .forEach((replica) => {
        replica.lag = this.lagMs;
      });
    this.onUpdate(this.getState());
  }

  getState(): ReplicationState {
    return {
      nodes: this.nodes.map((node) => ({
        ...node,
        data: { ...node.data },
      })),
      writeLog: this.writeLog.slice(-10).map((op) => ({
        ...op,
        syncedTo: [...op.syncedTo],
      })),
      mode: this.mode,
      lagMs: this.lagMs,
    };
  }

  private initializeNodes(): void {
    const now = Date.now();
    this.nodes = [
      {
        id: 'primary',
        name: 'Primary',
        role: 'primary',
        lag: 0,
        lastSyncedAt: now,
        isDown: false,
        data: {},
      },
      {
        id: 'replica_1',
        name: 'Replica 1',
        role: 'replica',
        lag: 0,
        lastSyncedAt: now,
        isDown: false,
        data: {},
      },
      {
        id: 'replica_2',
        name: 'Replica 2',
        role: 'replica',
        lag: 200,
        lastSyncedAt: now - 200,
        isDown: false,
        data: {},
      },
    ];
  }

  private async syncToReplicas(op: WriteOperation, waitForAll: boolean): Promise<void> {
    const replicas = this.nodes.filter((node) => node.role === 'replica' && !node.isDown);

    for (const replica of replicas) {
      if (op.syncedTo.includes(replica.id)) continue;

      if (waitForAll) {
        await new Promise((resolve) => {
          setTimeout(resolve, this.lagMs);
        });
      }

      replica.data[op.key] = op.value;
      replica.lag = Math.max(0, replica.lag - 50);
      replica.lastSyncedAt = Date.now();
      op.syncedTo.push(replica.id);
    }

    this.onUpdate(this.getState());
  }
}
