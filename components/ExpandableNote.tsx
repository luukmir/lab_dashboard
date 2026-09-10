'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export function ExpandableNote({ note }: { note: string | null }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!note) {
    return <span className="text-zinc-400 dark:text-zinc-600">-</span>;
  }

  return (
    <button
      type="button"
      onClick={() => setIsExpanded((expanded) => !expanded)}
      aria-expanded={isExpanded}
      className="group/note relative block w-full cursor-pointer pr-6 text-left text-zinc-800 dark:text-zinc-200"
      title={isExpanded ? 'クリックして縮小' : 'クリックして展開'}
    >
      <span className={`block ${isExpanded ? 'whitespace-pre-wrap break-words' : 'truncate whitespace-nowrap'}`}>
        {note}
      </span>
      <ChevronDown
        className={`pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 opacity-0 transition-transform group-hover/note:opacity-100 group-focus-visible/note:opacity-100 dark:text-zinc-400 ${isExpanded ? 'rotate-180 opacity-100' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
