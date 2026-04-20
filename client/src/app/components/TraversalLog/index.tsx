import React, { useEffect, useRef } from 'react';
import styled from 'styled-components/macro';
import { LogEntry } from 'types/tree';

interface TraversalLogProps {
  log: LogEntry[];
  currentStep: number;
}

export function TraversalLog({ log, currentStep }: TraversalLogProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeRef.current && listRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentStep]);

  if (log.length === 0) return null;

  const filteredLog = log.filter(
    entry => entry.action === 'visit' || entry.action === 'match',
  );

  return (
    <Container>
      <Header>
        <Title>Traversal Log</Title>
        <Count>{filteredLog.length} steps</Count>
      </Header>
      <LogList ref={listRef}>
        {filteredLog.map((entry, idx) => {
          const isActive = entry.step === currentStep;
          const isPast = entry.step < currentStep;

          return (
            <LogItem
              key={idx}
              ref={isActive ? activeRef : undefined}
              isActive={isActive}
              isPast={isPast}
            >
              <StepBadge isMatch={entry.action === 'match'} isActive={isActive}>
                {entry.step}
              </StepBadge>
              <LogContent>
                <LogAction isMatch={entry.action === 'match'}>
                  {entry.action.toUpperCase()}
                </LogAction>
                <LogTag>&lt;{entry.tag}&gt;</LogTag>
                <LogMeta>
                  ID:{entry.nodeId} D:{entry.depth} Q:{entry.queueSize}
                </LogMeta>
              </LogContent>
            </LogItem>
          );
        })}
      </LogList>
    </Container>
  );
}

const Container = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h3`
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
`;

const Count = styled.span`
  margin-left: auto;
  color: #666;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
`;

const LogList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
`;

const LogItem = styled.div<{ isActive: boolean; isPast: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  background: ${p => (p.isActive ? '#222' : 'transparent')};
  border: 1px solid ${p => (p.isActive ? '#444' : 'transparent')};
  opacity: ${p => (p.isPast ? 0.5 : 1)};
`;

const StepBadge = styled.span<{ isMatch: boolean; isActive: boolean }>`
  min-width: 28px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  background: ${p => (p.isActive ? '#fff' : p.isMatch ? '#333' : '#1a1a1a')};
  color: ${p => (p.isActive ? '#000' : p.isMatch ? '#fff' : '#888')};
`;

const LogContent = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

const LogAction = styled.span<{ isMatch: boolean }>`
  font-size: 0.7rem;
  font-weight: 600;
  color: ${p => (p.isMatch ? '#fff' : '#888')};
  white-space: nowrap;
  min-width: 40px;
`;

const LogTag = styled.span`
  color: #ccc;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  font-weight: 600;
`;

const LogMeta = styled.span`
  color: #555;
  font-size: 0.65rem;
  font-family: 'JetBrains Mono', monospace;
  margin-left: auto;
  white-space: nowrap;
`;
