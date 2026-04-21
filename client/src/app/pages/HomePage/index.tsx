import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components/macro';
import { InputPanel } from 'app/components/InputPanel';
import { TreeVisualizer } from 'app/components/TreeVisualizer';
import { ResultsPanel } from 'app/components/ResultsPanel';
import { TraversalLog } from 'app/components/TraversalLog';
import { AnimationControls } from 'app/components/AnimationControls';
import { searchTree } from 'services/api';
import {
  SearchFormData,
  SearchResponse,
  LogEntry,
  AnimationState,
} from 'types/tree';

const defaultForm: SearchFormData = {
  source: 'raw',
  url: '',
  html: `<html>
  <head><title>Contoh</title></head>
  <body>
    <div id="main" class="container">
      <h1 class="title">Hello World</h1>
      <div class="card">
        <p class="text">Paragraf pertama</p>
        <p class="text highlight">Paragraf kedua</p>
      </div>
      <div class="card special">
        <p class="text">Paragraf ketiga</p>
        <span class="badge">New</span>
      </div>
      <footer>
        <p>Footer content</p>
      </footer>
    </div>
  </body>
</html>`,
  selector: 'div.card > p',
  algorithm: 'bfs',
  limitType: 'all',
  limitN: 5,
  parallel: false,
};

export function HomePage() {
  const [formData, setFormData] = useState<SearchFormData>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SearchResponse | null>(null);

  const [animation, setAnimation] = useState<AnimationState>({
    isPlaying: false,
    currentStep: 0,
    speed: 1,
    totalSteps: 0,
  });

  const [visitedNodeIds, setVisitedNodeIds] = useState<Set<number>>(new Set());
  const [matchedNodeIds, setMatchedNodeIds] = useState<Set<number>>(new Set());
  const [currentVisitId, setCurrentVisitId] = useState<number | null>(null);

  const animationRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (animationRef.current) clearInterval(animationRef.current);
    };
  }, []);

  const updateHighlightsForStep = useCallback(
    (step: number, log: LogEntry[]) => {
      const visited = new Set<number>();
      const matched = new Set<number>();
      let currentId: number | null = null;

      const visitEntries = log.filter(
        e => e.action === 'visit' || e.action === 'match',
      );

      for (let i = 0; i < visitEntries.length; i++) {
        const entry = visitEntries[i];
        if (entry.step > step) break;
        if (entry.action === 'visit') {
          visited.add(entry.nodeId);
          currentId = entry.nodeId;
        } else if (entry.action === 'match') {
          matched.add(entry.nodeId);
        }
      }

      setVisitedNodeIds(visited);
      setMatchedNodeIds(matched);
      setCurrentVisitId(step > 0 ? currentId : null);
    },
    [],
  );

  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAnimation(prev => ({
      ...prev,
      isPlaying: false,
      currentStep: 0,
      totalSteps: 0,
    }));
    setVisitedNodeIds(new Set());
    setMatchedNodeIds(new Set());
    setCurrentVisitId(null);
    if (animationRef.current) clearInterval(animationRef.current);

    try {
      const limit = formData.limitType === 'all' ? 0 : formData.limitN;
      const res = await searchTree(
        formData.source,
        formData.url,
        formData.html,
        formData.selector,
        formData.algorithm,
        limit,
        formData.parallel,
      );

      setResult(res);

      const maxStep =
        res.log && res.log.length > 0
          ? res.log[res.log.length - 1].step
          : 0;

      setAnimation(prev => ({
        ...prev,
        totalSteps: maxStep,
        currentStep: maxStep,
      }));

      if (res.log) {
        updateHighlightsForStep(maxStep, res.log);
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  }, [formData, updateHighlightsForStep]);

  const handlePlay = useCallback(() => {
    if (!result || !result.log) return;

    setAnimation(prev => ({ ...prev, isPlaying: true }));

    const log = result.log;
    const visitSteps = log
      .filter(e => e.action === 'visit' || e.action === 'match')
      .map(e => e.step);

    let stepIdx = 0;

    setAnimation(prev => {
      const currentIdx = visitSteps.findIndex(s => s > prev.currentStep);
      stepIdx = currentIdx === -1 ? 0 : currentIdx;
      if (stepIdx === 0) {
        setVisitedNodeIds(new Set());
        setMatchedNodeIds(new Set());
        setCurrentVisitId(null);
      }
      return prev;
    });

    if (animationRef.current) clearInterval(animationRef.current);

    animationRef.current = setInterval(() => {
      if (stepIdx >= visitSteps.length) {
        if (animationRef.current) clearInterval(animationRef.current);
        setAnimation(prev => ({ ...prev, isPlaying: false }));
        return;
      }

      const targetStep = visitSteps[stepIdx];
      updateHighlightsForStep(targetStep, log);
      setAnimation(prev => ({ ...prev, currentStep: targetStep }));
      stepIdx++;
    }, 500 / animation.speed);
  }, [result, animation.speed, updateHighlightsForStep]);

  const handlePause = useCallback(() => {
    if (animationRef.current) clearInterval(animationRef.current);
    setAnimation(prev => ({ ...prev, isPlaying: false }));
  }, []);

  const handleStepForward = useCallback(() => {
    if (!result || !result.log) return;
    handlePause();

    const visitSteps = result.log
      .filter(e => e.action === 'visit' || e.action === 'match')
      .map(e => e.step);

    setAnimation(prev => {
      const nextIdx = visitSteps.findIndex(s => s > prev.currentStep);
      if (nextIdx !== -1) {
        const targetStep = visitSteps[nextIdx];
        updateHighlightsForStep(targetStep, result.log);
        return { ...prev, currentStep: targetStep };
      }
      return prev;
    });
  }, [result, handlePause, updateHighlightsForStep]);

  const handleStepBack = useCallback(() => {
    if (!result || !result.log) return;
    handlePause();

    const visitSteps = result.log
      .filter(e => e.action === 'visit' || e.action === 'match')
      .map(e => e.step);

    setAnimation(prev => {
      let prevStep = 0;
      for (const s of visitSteps) {
        if (s >= prev.currentStep) break;
        prevStep = s;
      }
      updateHighlightsForStep(prevStep, result.log);
      return { ...prev, currentStep: prevStep };
    });
  }, [result, handlePause, updateHighlightsForStep]);

  const handleReset = useCallback(() => {
    handlePause();
    setVisitedNodeIds(new Set());
    setMatchedNodeIds(new Set());
    setCurrentVisitId(null);
    setAnimation(prev => ({ ...prev, currentStep: 0 }));
  }, [handlePause]);

  const handleSpeedChange = useCallback(
    (speed: number) => {
      setAnimation(prev => ({ ...prev, speed }));
      if (animation.isPlaying) {
        handlePause();
        setTimeout(() => handlePlay(), 50);
      }
    },
    [animation.isPlaying, handlePause, handlePlay],
  );

  return (
    <>
      <Helmet>
        <title>Traversal</title>
        <meta
          name="description"
          content="Visualisasi traversal pohon DOM menggunakan BFS dan DFS"
        />
      </Helmet>

      <PageContainer>
        {error && (
          <ErrorBanner>
            {error}
            <ErrorClose onClick={() => setError(null)}>x</ErrorClose>
          </ErrorBanner>
        )}

        <MainGrid>
          <LeftPanel>
            <InputPanel
              formData={formData}
              onFormChange={setFormData}
              onSubmit={handleSubmit}
              loading={loading}
            />

            {result && (
              <>
                <AnimationControls
                  animation={animation}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  onStepForward={handleStepForward}
                  onStepBack={handleStepBack}
                  onReset={handleReset}
                  onSpeedChange={handleSpeedChange}
                />

                <ResultsPanel
                  matches={result.matches}
                  visitedCount={result.visitedCount}
                  executionTimeMs={result.executionTimeMs}
                  totalNodes={result.totalNodes}
                  maxDepth={result.maxDepth}
                  algorithm={result.algorithm}
                  parallel={result.parallel}
                />

                <TraversalLog
                  log={result.log || []}
                  currentStep={animation.currentStep}
                />
              </>
            )}
          </LeftPanel>

          <RightPanel>
            <TreeVisualizer
              tree={result?.tree || null}
              visitedNodeIds={visitedNodeIds}
              matchedNodeIds={matchedNodeIds}
              currentVisitId={currentVisitId}
              lcaPathIds={new Set()}
              maxDepth={result?.maxDepth || 0}
              totalNodes={result?.totalNodes || 0}
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
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ErrorClose = styled.button`
  margin-left: auto;
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    color: #fff;
  }
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
  max-height: calc(100vh - 86px);
  overflow-y: auto;
  padding-right: 4px;

  /* Thin scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #333 transparent;
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-track { background: transparent; }
  &::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
`;

const RightPanel = styled.div`
  position: sticky;
  top: 66px;
  height: calc(100vh - 86px);
`;
