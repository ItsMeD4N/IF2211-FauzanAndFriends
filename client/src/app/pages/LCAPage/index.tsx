import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { TreeVisualizer } from 'app/components/TreeVisualizer';
import { parseHTML, findLCA } from 'services/api';
import { TreeNode, LCAResponse, SourceType } from 'types/tree';

export function LCAPage() {
  const [source, setSource] = useState<SourceType>('raw');
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState(
    `<html><body><div id="root"><div id="a"><p id="x">X</p><p id="y">Y</p></div><div id="b"><span id="z">Z</span></div></div></body></html>`,
  );
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [totalNodes, setTotalNodes] = useState(0);
  const [maxDepth, setMaxDepth] = useState(0);
  const [selectedNodes, setSelectedNodes] = useState<number[]>([]);
  const [lcaResult, setLcaResult] = useState<LCAResponse | null>(null);
  const [lcaPathIds, setLcaPathIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleParse = useCallback(async () => {
    setLoading(true);
    setError(null);
    setLcaResult(null);
    setLcaPathIds(new Set());
    setSelectedNodes([]);
    try {
      const res = await parseHTML(source, url, html);
      setTree(res.tree);
      setTotalNodes(res.totalNodes);
      setMaxDepth(res.maxDepth);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [source, url, html]);

  const handleNodeClick = useCallback((nodeId: number) => {
    setSelectedNodes(prev => {
      if (prev.length >= 2) return [nodeId];
      if (prev.includes(nodeId)) return prev.filter(id => id !== nodeId);
      return [...prev, nodeId];
    });
  }, []);

  const handleFindLCA = useCallback(async () => {
    if (selectedNodes.length !== 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await findLCA(source, url, html, selectedNodes[0], selectedNodes[1]);
      setLcaResult(res);
      setLcaPathIds(new Set([...res.pathFromNode1, ...res.pathFromNode2]));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedNodes, source, url, html]);

  return (
    <>
      <Helmet>
        <title>LCA Binary Lifting</title>
        <meta name="description" content="Lowest Common Ancestor pada DOM Tree" />
      </Helmet>

      <PageContainer>
        {error && <ErrorBanner>{error}</ErrorBanner>}

        <MainGrid>
          <LeftPanel>
            <Card>
              <CardTitle>Input HTML</CardTitle>
              <RadioGroup>
                <RadioLabel active={source === 'raw'}>
                  <input type="radio" hidden checked={source === 'raw'} onChange={() => setSource('raw')} />
                  Raw HTML
                </RadioLabel>
                <RadioLabel active={source === 'url'}>
                  <input type="radio" hidden checked={source === 'url'} onChange={() => setSource('url')} />
                  URL
                </RadioLabel>
              </RadioGroup>

              {source === 'url' ? (
                <Input placeholder="https://example.com" value={url} onChange={e => setUrl(e.target.value)} />
              ) : (
                <TextArea value={html} onChange={e => setHtml(e.target.value)} rows={4} />
              )}

              <ActionBtn onClick={handleParse} disabled={loading}>
                {loading ? 'Memproses...' : 'Parse Tree'}
              </ActionBtn>
            </Card>

            {tree && (
              <Card>
                <CardTitle>Pilih 2 Node</CardTitle>
                <InfoText>
                  Klik dua node pada tree. Terpilih:{' '}
                  {selectedNodes.map(id => (
                    <SelectedBadge key={id}>ID: {id}</SelectedBadge>
                  ))}
                  {selectedNodes.length < 2 && (
                    <span style={{ color: '#555' }}> ({2 - selectedNodes.length} lagi)</span>
                  )}
                </InfoText>
                <ActionBtn onClick={handleFindLCA} disabled={selectedNodes.length !== 2 || loading}>
                  Cari LCA
                </ActionBtn>
              </Card>
            )}

            {lcaResult && (
              <Card>
                <CardTitle>Hasil LCA</CardTitle>
                <ResultGrid>
                  <ResultRow>
                    <ResultLabel>LCA Node</ResultLabel>
                    <ResultValue>&lt;{lcaResult.lcaTag}&gt; (ID: {lcaResult.lcaNodeId})</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Depth</ResultLabel>
                    <ResultValue>{lcaResult.lcaDepth}</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Path dari Node 1</ResultLabel>
                    <ResultValue>{lcaResult.pathFromNode1.join(' > ')}</ResultValue>
                  </ResultRow>
                  <ResultRow>
                    <ResultLabel>Path dari Node 2</ResultLabel>
                    <ResultValue>{lcaResult.pathFromNode2.join(' > ')}</ResultValue>
                  </ResultRow>
                </ResultGrid>
              </Card>
            )}
          </LeftPanel>

          <RightPanel>
            <TreeVisualizer
              tree={tree}
              visitedNodeIds={new Set(selectedNodes)}
              matchedNodeIds={lcaResult ? new Set([lcaResult.lcaNodeId]) : new Set()}
              currentVisitId={null}
              lcaPathIds={lcaPathIds}
              maxDepth={maxDepth}
              totalNodes={totalNodes}
              onNodeClick={handleNodeClick}
            />
          </RightPanel>
        </MainGrid>
      </PageContainer>
    </>
  );
}

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px;
`;

const ErrorBanner = styled.div`
  background: #1a1a1a;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 12px 16px;
  color: #ccc;
  margin-bottom: 16px;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: 380px 1fr;
  gap: 20px;
  align-items: start;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const LeftPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightPanel = styled.div`
  position: sticky;
  top: 76px;
  height: calc(100vh - 96px);
`;

const Card = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardTitle = styled.h3`
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const RadioLabel = styled.label<{ active: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  color: ${p => (p.active ? '#fff' : '#888')};
  background: ${p => (p.active ? '#333' : '#1a1a1a')};
  border: 1px solid ${p => (p.active ? '#555' : '#2a2a2a')};
  flex: 1;
  justify-content: center;
`;

const Input = styled.input`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 12px;
  outline: none;
  &:focus { border-color: #888; }
`;

const TextArea = styled.textarea`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 6px;
  color: #fff;
  padding: 10px 12px;
  font-family: monospace;
  font-size: 0.82rem;
  resize: vertical;
  outline: none;
  &:focus { border-color: #888; }
`;

const ActionBtn = styled.button`
  background: #fff;
  color: #000;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(:disabled) { background: #ddd; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
`;

const InfoText = styled.div`
  color: #888;
  font-size: 0.82rem;
  line-height: 1.6;
`;

const SelectedBadge = styled.span`
  background: #1a1a1a;
  color: #ccc;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.78rem;
  font-family: monospace;
  margin: 0 2px;
`;

const ResultGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ResultRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ResultLabel = styled.span`
  color: #888;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: 600;
`;

const ResultValue = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-family: monospace;
`;
