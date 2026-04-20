import React, { useMemo, useCallback } from 'react';
import Tree from 'react-d3-tree';
import styled from 'styled-components/macro';
import { TreeNode } from 'types/tree';
import { CustomNode } from './CustomNode';

interface TreeVisualizerProps {
  tree: TreeNode | null;
  visitedNodeIds: Set<number>;
  matchedNodeIds: Set<number>;
  currentVisitId: number | null;
  lcaPathIds: Set<number>;
  maxDepth: number;
  totalNodes: number;
  onNodeClick?: (nodeId: number) => void;
}
                 
function convertToD3Tree(node: TreeNode): any {
  return {
    name: node.name || node.tag,
    attributes: {
      id: String(node.id),
      tag: node.tag,
      depth: String(node.depth),
      ...(node.attributes || {}),
    },
    __nodeId: node.id,
    __tag: node.tag,
    __depth: node.depth,
    __textContent: node.textContent || '',
    children: node.children
      ? node.children.map(child => convertToD3Tree(child))
      : undefined,
  };
}

export function TreeVisualizer({
  tree,
  visitedNodeIds,
  matchedNodeIds,
  currentVisitId,
  lcaPathIds,
  maxDepth,
  totalNodes,
  onNodeClick,
}: TreeVisualizerProps) {
  const d3Tree = useMemo(() => {
    if (!tree) return null;
    return convertToD3Tree(tree);
  }, [tree]);

  const renderCustomNode = useCallback(
    ({ nodeDatum, toggleNode }: any) => {
      const nodeId = nodeDatum.__nodeId as number;
      return (
        <CustomNode
          nodeDatum={nodeDatum}
          isVisited={visitedNodeIds.has(nodeId)}
          isMatched={matchedNodeIds.has(nodeId)}
          isCurrent={currentVisitId === nodeId}
          isLCAPath={lcaPathIds.has(nodeId)}
          onClick={() => {
            if (onNodeClick) onNodeClick(nodeId);
            toggleNode();
          }}
        />
      );
    },
    [visitedNodeIds, matchedNodeIds, currentVisitId, lcaPathIds, onNodeClick],
  );

  if (!d3Tree) {
    return (
      <EmptyState>
        <EmptyTitle>Belum ada data</EmptyTitle>
        <EmptyText>Masukkan HTML dan jalankan traversal untuk melihat pohon DOM</EmptyText>
      </EmptyState>
    );
  }

  return (
    <Container>
      <StatsBar>
        <Stat>
          Total: <b>{totalNodes}</b> node
        </Stat>
        <Stat>
          Max Depth: <b>{maxDepth}</b>
        </Stat>
        <Legend>
          <LegendItem border="#888">Visited</LegendItem>
          <LegendItem border="#fff">Matched</LegendItem>
        </Legend>
      </StatsBar>
      <TreeWrapper>
        <Tree
          data={d3Tree}
          orientation="vertical"
          pathFunc="step"
          translate={{ x: 400, y: 50 }}
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 180, y: 90 }}
          renderCustomNodeElement={renderCustomNode}
          collapsible={true}
          zoomable={true}
          draggable={true}
          scaleExtent={{ min: 0.1, max: 3 }}
          pathClassFunc={() => 'tree-link'}
        />
      </TreeWrapper>
    </Container>
  );
}

const Container = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 500px;
`;

const StatsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  border-bottom: 1px solid #222;
`;

const Stat = styled.span`
  color: #888;
  font-size: 0.8rem;
  b {
    color: #fff;
  }
`;

const Legend = styled.div`
  display: flex;
  gap: 12px;
  margin-left: auto;
`;

const LegendItem = styled.span<{ border: string }>`
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  color: #888;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1.5px solid ${p => p.border};
    background: transparent;
  }
`;

const TreeWrapper = styled.div`
  flex: 1;
  width: 100%;
  min-height: 450px;

  .rd3t-link,
  .tree-link {
    stroke: #333 !important;
    stroke-width: 1px !important;
  }
`;

const EmptyState = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  gap: 8px;
`;

const EmptyTitle = styled.div`
  color: #666;
  font-size: 1rem;
  font-weight: 600;
`;

const EmptyText = styled.div`
  color: #444;
  font-size: 0.85rem;
`;
