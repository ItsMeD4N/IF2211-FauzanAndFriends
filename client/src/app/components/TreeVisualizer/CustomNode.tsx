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
  const nodeId = nodeDatum.__nodeId;
  const textContent = nodeDatum.__textContent || '';
  const isTextNode = tag === '#text';

  let fillColor = '#1a1a1a';
  let strokeColor = '#444';
  let textColor = '#ccc';
  let strokeWidth = 1.5;

  if (isCurrent) {
    fillColor = '#333';
    strokeColor = '#fff';
    textColor = '#fff';
    strokeWidth = 2.5;
  } else if (isMatched) {
    fillColor = '#2a2a2a';
    strokeColor = '#fff';
    textColor = '#fff';
    strokeWidth = 2;
  } else if (isLCAPath) {
    fillColor = '#222';
    strokeColor = '#bbb';
    textColor = '#ddd';
    strokeWidth = 2;
  } else if (isVisited) {
    fillColor = '#222';
    strokeColor = '#888';
    textColor = '#aaa';
    strokeWidth = 1.5;
  }

  let displayText = tag;
  if (isTextNode) {
    displayText =
      textContent.length > 20
        ? textContent.substring(0, 20) + '...'
        : textContent;
  }

  const htmlId = nodeDatum.attributes?.id || '';
  const htmlClass = nodeDatum.attributes?.class || '';
  let subtitle = '';
  if (htmlId && htmlId !== String(nodeId)) subtitle += `#${htmlId}`;
  if (htmlClass) {
    const firstClass = htmlClass.split(' ')[0];
    subtitle += subtitle ? ` .${firstClass}` : `.${firstClass}`;
  }
  if (subtitle.length > 22) subtitle = subtitle.substring(0, 22) + '...';

  const nodeWidth = 140;
  const nodeHeight = subtitle ? 44 : 34;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {isCurrent && (
        <rect
          x={-nodeWidth / 2 - 2}
          y={-nodeHeight / 2 - 2}
          width={nodeWidth + 4}
          height={nodeHeight + 4}
          rx={8}
          fill="none"
          stroke="#fff"
          strokeWidth={1}
          opacity={0.4}
        />
      )}

      <rect
        x={-nodeWidth / 2}
        y={-nodeHeight / 2}
        width={nodeWidth}
        height={nodeHeight}
        rx={6}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />

      <text
        fill={textColor}
        fontSize={isTextNode ? 10 : 12}
        fontWeight={600}
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        textAnchor="middle"
        dy={subtitle ? '-0.15em' : '0.35em'}
      >
        {isTextNode ? `"${displayText}"` : `<${displayText}>`}
      </text>

      {subtitle && !isTextNode && (
        <text
          fill={isVisited || isMatched || isCurrent ? '#999' : '#666'}
          fontSize={9}
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="middle"
          dy="1.3em"
        >
          {subtitle}
        </text>
      )}

      <circle
        cx={nodeWidth / 2 - 2}
        cy={-nodeHeight / 2 + 2}
        r={8}
        fill="#0a0a0a"
        stroke={strokeColor}
        strokeWidth={1}
      />
      <text
        x={nodeWidth / 2 - 2}
        y={-nodeHeight / 2 + 2}
        fill="#888"
        fontSize={7}
        fontWeight={700}
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="'JetBrains Mono', monospace"
      >
        {nodeId}
      </text>
    </g>
  );
}
