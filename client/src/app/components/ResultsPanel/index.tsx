import React from 'react';
import styled from 'styled-components/macro';
import { MatchedNode } from 'types/tree';

interface ResultsPanelProps {
  matches: MatchedNode[] | null;
  visitedCount: number;
  executionTimeMs: number;
  totalNodes: number;
  maxDepth: number;
  algorithm: string;
  parallel: boolean;
  onMatchClick?: (nodeId: number) => void;
}

export function ResultsPanel({
  matches,
  visitedCount,
  executionTimeMs,
  totalNodes,
  maxDepth,
  algorithm,
  parallel,
  onMatchClick,
}: ResultsPanelProps) {
  const matchCount = matches ? matches.length : 0;

  return (
    <Container>
      <Title>Hasil Pencarian</Title>

      <MetricsGrid>
        <MetricCard>
          <MetricValue>{executionTimeMs.toFixed(3)}</MetricValue>
          <MetricLabel>Waktu (ms)</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{visitedCount}</MetricValue>
          <MetricLabel>Node Dikunjungi</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{matchCount}</MetricValue>
          <MetricLabel>Ditemukan</MetricLabel>
        </MetricCard>
        <MetricCard>
          <MetricValue>{algorithm.toUpperCase()}</MetricValue>
          <MetricLabel>{parallel ? 'Parallel' : 'Sequential'}</MetricLabel>
        </MetricCard>
      </MetricsGrid>

      {matchCount > 0 && (
        <TableWrapper>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Tag</Th>
                <Th>Attributes</Th>
                <Th>Depth</Th>
                <Th>Path</Th>
              </tr>
            </thead>
            <tbody>
              {matches!.map((match, idx) => (
                <Tr
                  key={idx}
                  onClick={() => onMatchClick && onMatchClick(match.id)}
                >
                  <Td>
                    <IdBadge>{match.id}</IdBadge>
                  </Td>
                  <Td>
                    <TagText>&lt;{match.tag}&gt;</TagText>
                  </Td>
                  <Td>
                    <AttrList>
                      {match.attributes &&
                        Object.entries(match.attributes)
                          .filter(([k]) => k === 'id' || k === 'class')
                          .map(([k, v]) => (
                            <AttrBadge key={k}>
                              {k}="{v}"
                            </AttrBadge>
                          ))}
                    </AttrList>
                  </Td>
                  <Td>{match.depth}</Td>
                  <Td>
                    <PathText>{match.path}</PathText>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>
      )}

      {matchCount === 0 && visitedCount > 0 && (
        <EmptyResult>Tidak ditemukan elemen yang cocok</EmptyResult>
      )}
    </Container>
  );
}

const Container = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
`;

const Title = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 16px 0;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MetricCard = styled.div`
  background: #1a1a1a;
  border: 1px solid #2a2a2a;
  border-radius: 6px;
  padding: 10px 8px;
  text-align: center;
  min-width: 0;
  overflow: hidden;
`;

const MetricValue = styled.div`
  font-size: 1rem;
  font-weight: 800;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MetricLabel = styled.div`
  font-size: 0.7rem;
  color: #666;
  margin-top: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 10px;
  color: #888;
  font-weight: 600;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid #2a2a2a;
  background: #151515;
`;

const Tr = styled.tr`
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: #1a1a1a;
  }

  &:not(:last-child) {
    border-bottom: 1px solid #1a1a1a;
  }
`;

const Td = styled.td`
  padding: 6px 10px;
  color: #ccc;
`;

const IdBadge = styled.span`
  background: #1a1a1a;
  color: #aaa;
  padding: 2px 6px;
  border-radius: 3px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
`;

const TagText = styled.span`
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
`;

const AttrList = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const AttrBadge = styled.span`
  background: #1a1a1a;
  color: #999;
  padding: 1px 5px;
  border-radius: 3px;
  font-size: 0.72rem;
  font-family: 'JetBrains Mono', monospace;
`;

const PathText = styled.span`
  color: #666;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  word-break: break-all;
`;

const EmptyResult = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
  font-size: 0.85rem;
`;
