import React from 'react';
import styled from 'styled-components/macro';
import { AnimationState } from 'types/tree';

interface AnimationControlsProps {
  animation: AnimationState;
  onPlay: () => void;
  onPause: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export function AnimationControls({
  animation,
  onPlay,
  onPause,
  onStepForward,
  onStepBack,
  onReset,
  onSpeedChange,
}: AnimationControlsProps) {
  if (animation.totalSteps === 0) return null;

  const progress =
    animation.totalSteps > 0
      ? (animation.currentStep / animation.totalSteps) * 100
      : 0;

  return (
    <Container>
      <TopRow>
        <ControlGroup>
          <Btn onClick={onReset}>Reset</Btn>
          <Btn onClick={onStepBack}>&lt;&lt;</Btn>
          <PlayBtn
            onClick={animation.isPlaying ? onPause : onPlay}
            isPlaying={animation.isPlaying}
          >
            {animation.isPlaying ? 'Pause' : 'Play'}
          </PlayBtn>
          <Btn onClick={onStepForward}>&gt;&gt;</Btn>
        </ControlGroup>

        <StepCounter>
          {animation.currentStep} / {animation.totalSteps}
        </StepCounter>

        <SpeedControl>
          <SpeedLabel>{animation.speed.toFixed(1)}x</SpeedLabel>
          <SpeedSlider
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={animation.speed}
            onChange={e => onSpeedChange(parseFloat(e.target.value))}
          />
        </SpeedControl>
      </TopRow>

      <ProgressTrack>
        <ProgressFill style={{ width: `${progress}%` }} />
      </ProgressTrack>
    </Container>
  );
}

const Container = styled.div`
  background: #111;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Btn = styled.button`
  background: #1a1a1a;
  border: 1px solid #333;
  border-radius: 4px;
  color: #ccc;
  padding: 5px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  transition: background 0.1s;

  &:hover {
    background: #2a2a2a;
  }
`;

const PlayBtn = styled.button<{ isPlaying: boolean }>`
  background: ${p => (p.isPlaying ? '#333' : '#fff')};
  border: 1px solid ${p => (p.isPlaying ? '#555' : '#fff')};
  border-radius: 4px;
  color: ${p => (p.isPlaying ? '#fff' : '#000')};
  padding: 5px 16px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    opacity: 0.8;
  }
`;

const StepCounter = styled.div`
  color: #888;
  font-size: 0.78rem;
  font-family: 'JetBrains Mono', monospace;
  min-width: 80px;
  text-align: center;
`;

const SpeedControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
`;

const SpeedLabel = styled.span`
  color: #888;
  font-size: 0.75rem;
  font-family: 'JetBrains Mono', monospace;
  min-width: 32px;
`;

const SpeedSlider = styled.input`
  appearance: none;
  width: 80px;
  height: 3px;
  background: #333;
  border-radius: 3px;
  outline: none;

  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: #fff;
    cursor: pointer;
  }
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 2px;
  background: #222;
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #fff;
  border-radius: 2px;
  transition: width 0.15s;
`;
