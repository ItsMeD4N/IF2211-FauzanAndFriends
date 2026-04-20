import {
  ParseResponse,
  SearchResponse,
  LCAResponse,
  SourceType,
  AlgorithmType,
} from 'types/tree';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function request<T>(endpoint: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export async function parseHTML(
  source: SourceType,
  url: string,
  html: string,
): Promise<ParseResponse> {
  return request<ParseResponse>('/api/parse', { source, url, html });
}

export async function searchTree(
  source: SourceType,
  url: string,
  html: string,
  selector: string,
  algorithm: AlgorithmType,
  limit: number,
  parallel: boolean,
): Promise<SearchResponse> {
  return request<SearchResponse>('/api/search', {
    source,
    url,
    html,
    selector,
    algorithm,
    limit,
    parallel,
  });
}

export async function findLCA(
  source: SourceType,
  url: string,
  html: string,
  nodeId1: number,
  nodeId2: number,
): Promise<LCAResponse> {
  return request<LCAResponse>('/api/lca', {
    source,
    url,
    html,
    nodeId1,
    nodeId2,
  });
}
