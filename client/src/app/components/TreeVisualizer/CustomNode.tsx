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

  const fillColor = '#000';
  let strokeColor = '#fff';
  let textColor = '#fff';
  let strokeWidth = 1.5;
  let nodeOpacity = 1;
  let glowOpacity = 0;

  if (isCurrent) {
    strokeWidth = 2.5;
    glowOpacity = 0.35;
    nodeOpacity = 1;
  } else if (isMatched) {
    strokeWidth = 2;
    glowOpacity = 0.2;
    nodeOpacity = 1;
  } else if (isLCAPath) {
    strokeWidth = 2;
    nodeOpacity = 0.9;
  } else if (isVisited) {
    strokeWidth = 1.5;
    nodeOpacity = 0.75;
  } else {
    strokeColor = '#555';
    strokeWidth = 1;
    nodeOpacity = 0.45;
  }

  let displayText = tag;
  if (isTextNode) {
    displayText =
      textContent.length > 24
        ? textContent.substring(0, 24) + '…'
        : textContent;
  } else {
    displayText =
      tag.length > 16 ? tag.substring(0, 14) + '…' : tag;
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

  const nodeWidth = 160;
  const nodeHeight = subtitle ? 48 : 38;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer', opacity: nodeOpacity }}>
      {glowOpacity > 0 && (
        <rect
          x={-nodeWidth / 2 - 4}
          y={-nodeHeight / 2 - 4}
          width={nodeWidth + 8}
          height={nodeHeight + 8}
          rx={10}
          fill="none"
          stroke="#ffffff"
          strokeWidth={1.5}
          opacity={glowOpacity}
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
        style={{ fill: textColor }}
        fontSize={isTextNode ? 11 : 13}
        fontWeight={700}
        fontFamily="'JetBrains Mono', 'Courier New', monospace"
        textAnchor="middle"
        dy={subtitle ? '-0.2em' : '0.35em'}
      >
        {isTextNode ? `"${displayText}"` : `<${displayText}>`}
      </text>

      {subtitle && !isTextNode && (
        <text
          fill="#888"
          fontSize={10}
          fontFamily="'JetBrains Mono', monospace"
          textAnchor="middle"
          dy="1.4em"
        >
          {subtitle}
        </text>
      )}

      <circle
        cx={nodeWidth / 2 - 3}
        cy={-nodeHeight / 2 + 3}
        r={9}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={1}
      />
      <text
        x={nodeWidth / 2 - 3}
        y={-nodeHeight / 2 + 3}
        fill={textColor}
        style={{ fill: textColor }}
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
