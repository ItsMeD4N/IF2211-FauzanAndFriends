import React from 'react';

interface CustomNodeProps {
  nodeDatum: any;
  isVisited: boolean;
  isMatched: boolean;
  isCurrent: boolean;
  isLCAPath: boolean;
  onClick: () => void;
}

export function CustomNode({
  nodeDatum,
  isVisited,
  isMatched,
  isCurrent,
  isLCAPath,
  onClick,
}: CustomNodeProps) {
  const tag = nodeDatum.__tag || nodeDatum.name;
  const textContent = nodeDatum.__textContent || '';
  const isTextNode = tag === '#text';

  let displayText = tag;
  if (isTextNode) {
    displayText =
      textContent.length > 20 ? textContent.substring(0, 20) + '…' : textContent;
  } else {
    displayText = tag.length > 14 ? tag.substring(0, 12) + '…' : tag;
  }

  const label = isTextNode ? `"${displayText}"` : `<${displayText}>`;

let circleColor = '#3a3a3a';
  let circleBorder = '#666';
  let textColor = '#ffffff';
  let opacity = 0.55;

  if (isCurrent) {
    circleColor = '#a855f7';
    circleBorder = '#c084fc';
    textColor = '#e9d5ff';
    opacity = 1;
  } else if (isMatched) {
    circleColor = '#22c55e';
    circleBorder = '#4ade80';
    textColor = '#bbf7d0';
    opacity = 1;
  } else if (isLCAPath) {
    circleColor = '#f59e0b';
    circleBorder = '#fcd34d';
    textColor = '#fef3c7';
    opacity = 1;
  } else if (isVisited) {
    circleColor = '#3b82f6';
    circleBorder = '#60a5fa';
    textColor = '#bfdbfe';
    opacity = 1;
  }

  return (
    <g onClick={onClick} style={{ cursor: 'pointer', opacity }}>
      
      <circle r={8} fill={circleColor} stroke={circleBorder} strokeWidth={1.5} />

<foreignObject x={14} y={-11} width={160} height={22}>
        <div
          style={{
            color: textColor,
            fontSize: '13px',
            fontWeight: 600,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            whiteSpace: 'nowrap',
            lineHeight: '22px',
            userSelect: 'none',
          }}
        >
          {label}
        </div>
      </foreignObject>
    </g>
  );
}
