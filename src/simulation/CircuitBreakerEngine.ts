export type CBState = 'closed' | 'open' | 'half_open';

export interface CircuitBreaker {
  id: string;
  name: string;
  state: CBState;
  failureCount: number;
  failureThreshold: number;
  successCount: number;
  successThreshold: number;
  timeout: number;
  lastFailureAt: number;
  totalRequests: number;
  totalFailures: number;
}

export class CircuitBreakerEngine {
  private breaker: CircuitBreaker;
  private onUpdate: (state: CircuitBreaker) => void;
  private timeoutRef: ReturnType<typeof setTimeout> | null = null;

  constructor(onUpdate: (state: CircuitBreaker) => void) {
    this.onUpdate = onUpdate;
    this.breaker = {
      id: 'cb_1',
      name: 'Payment Service',
      state: 'closed',
      failureCount: 0,
      failureThreshold: 5,
      successCount: 0,
      successThreshold: 3,
      timeout: 5_000,
      lastFailureAt: 0,
      totalRequests: 0,
      totalFailures: 0,
    };
  }

  sendRequest(shouldFail: boolean): { allowed: boolean; result: 'success' | 'failure' | 'rejected' } {
    this.breaker.totalRequests += 1;

    if (this.breaker.state === 'open') {
      if (Date.now() - this.breaker.lastFailureAt >= this.breaker.timeout) {
        this.breaker.state = 'half_open';
        this.breaker.successCount = 0;
      } else {
        this.onUpdate(this.getState());
        return { allowed: false, result: 'rejected' };
      }
    }

    if (shouldFail) {
      this.breaker.failureCount += 1;
      this.breaker.totalFailures += 1;
      this.breaker.lastFailureAt = Date.now();

      if (this.breaker.state === 'half_open') {
        this.breaker.state = 'open';
        this.scheduleHalfOpen();
      } else if (this.breaker.failureCount >= this.breaker.failureThreshold) {
        this.breaker.state = 'open';
        this.scheduleHalfOpen();
      }

      this.onUpdate(this.getState());
      return { allowed: true, result: 'failure' };
    }

    if (this.breaker.state === 'half_open') {
      this.breaker.successCount += 1;
      if (this.breaker.successCount >= this.breaker.successThreshold) {
        this.breaker.state = 'closed';
        this.breaker.failureCount = 0;
        this.breaker.successCount = 0;
      }
    } else {
      this.breaker.failureCount = Math.max(0, this.breaker.failureCount - 1);
    }

    this.onUpdate(this.getState());
    return { allowed: true, result: 'success' };
  }

  reset(): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
      this.timeoutRef = null;
    }
    this.breaker.state = 'closed';
    this.breaker.failureCount = 0;
    this.breaker.successCount = 0;
    this.breaker.lastFailureAt = 0;
    this.onUpdate(this.getState());
  }

  getState(): CircuitBreaker {
    return { ...this.breaker };
  }

  private scheduleHalfOpen(): void {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }

    this.timeoutRef = setTimeout(() => {
      if (this.breaker.state === 'open') {
        this.breaker.state = 'half_open';
        this.breaker.successCount = 0;
        this.onUpdate(this.getState());
      }
    }, this.breaker.timeout);
  }
}
