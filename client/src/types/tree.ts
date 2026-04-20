export interface TreeNode {
  id: number;
  tag: string;
  name: string;
  attributes?: Record<string, string>;
  children?: TreeNode[];
  depth: number;
  textContent?: string;
}

export interface MatchedNode {
  id: number;
  tag: string;
  attributes?: Record<string, string>;
  depth: number;
  path: string;
  textContent?: string;
}

export interface LogEntry {
  step: number;
  nodeId: number;
  tag: string;
  action: 'visit' | 'match' | 'enqueue' | 'skip';
  queueSize: number;
  depth: number;
}

export interface ParseResponse {
  tree: TreeNode;
  totalNodes: number;
  maxDepth: number;
}

export interface SearchResponse {
  tree: TreeNode;
  matches: MatchedNode[] | null;
  matchCount: number;
  totalNodes: number;
  maxDepth: number;
  visitedCount: number;
  executionTimeMs: number;
  log: LogEntry[];
  algorithm: string;
  selectorUsed: string;
  parallel: boolean;
}

export interface LCAResponse {
  tree: TreeNode;
  lcaNodeId: number;
  lcaTag: string;
  lcaDepth: number;
  pathFromNode1: number[];
  pathFromNode2: number[];
  totalNodes: number;
  maxDepth: number;
}

export interface ErrorResponse {
  error: string;
}

export type SourceType = 'url' | 'raw';
export type AlgorithmType = 'bfs' | 'dfs';
export type LimitType = 'all' | 'topn';
export type NodeState = 'idle' | 'visiting' | 'visited' | 'matched' | 'lca-path';

export interface SearchFormData {
  source: SourceType;
  url: string;
  html: string;
  selector: string;
  algorithm: AlgorithmType;
  limitType: LimitType;
  limitN: number;
  parallel: boolean;
}

export interface AnimationState {
  isPlaying: boolean;
  currentStep: number;
  speed: number; // multiplier
  totalSteps: number;
}
