export interface User {
  _id: string;
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  plan?: string;
}

export type EdgeProtocol = 'http' | 'database' | 'cache' | 'queue';

export type IssueSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  severity: IssueSeverity;
  rule: string;
  message: string;
  edgeId?: string;
  nodeId?: string;
}

export interface CanvasSnapshot {
  title: string;
  module: string;
  canvasJson: string;
}
