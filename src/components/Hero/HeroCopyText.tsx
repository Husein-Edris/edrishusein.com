import Link from 'next/link';
import { Fragment, type ReactNode } from 'react';
import type { HeroCopyNode } from './heroCopy';
import { isInternalPath } from './heroContent';

// Renders the parsed hero paragraph as React elements; no HTML is injected.
function renderNodes(nodes: HeroCopyNode[]): ReactNode {
  return nodes.map((node, index) => {
    switch (node.kind) {
      case 'text':
        return <Fragment key={index}>{node.text}</Fragment>;
      case 'br':
        return <br key={index} />;
      case 'strong':
        return <strong key={index}>{renderNodes(node.children)}</strong>;
      case 'em':
        return <em key={index}>{renderNodes(node.children)}</em>;
      case 'a':
        return isInternalPath(node.href) ? (
          <Link key={index} href={node.href}>
            {renderNodes(node.children)}
          </Link>
        ) : (
          <a key={index} href={node.href}>
            {renderNodes(node.children)}
          </a>
        );
    }
  });
}

export default function HeroCopyText({ nodes }: { nodes: HeroCopyNode[] }) {
  return <>{renderNodes(nodes)}</>;
}
