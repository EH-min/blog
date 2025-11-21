'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  className?: string;
  children: React.ReactNode;
}

export function CodeBlock({ className, children }: CodeBlockProps) {
  const [isCopied, setIsCopied] = useState(false);

  // Extract text from children for copying
  const getTextFromChildren = (children: React.ReactNode): string => {
    let text = '';
    React.Children.forEach(children, (child) => {
      if (typeof child === 'string') {
        text += child;
      } else if (React.isValidElement(child) && child.props.children) {
        text += getTextFromChildren(child.props.children);
      }
    });
    return text;
  };

  const handleCopy = async () => {
    const code = getTextFromChildren(children);
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white backdrop-blur-sm transition-colors"
          aria-label="Copy code"
        >
          {isCopied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
      <pre className={className}>
        {children}
      </pre>
    </div>
  );
}
