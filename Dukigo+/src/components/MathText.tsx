"use client";

import React, { useMemo } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MathTextProps {
  text: string;
  className?: string;
  inline?: boolean;
}

/**
 * Renders text with embedded LaTeX (\( ... \), $ ... $, \[ ... \], $$ ... $$)
 * and specific shorthand symbols.
 */
export const MathText: React.FC<MathTextProps> = ({ text, className, inline }) => {
  const content = useMemo(() => {
    if (!text) return "";

    // 1. Pre-process specific shorthands that might not be in standard LaTeX blocks
    let processed = text
      // Handle \rightarrow, \Omega etc if they are outside $...$
      .replace(/\\rightarrow/g, '→')
      .replace(/\\Rightarrow/g, '⇒')
      .replace(/\\Omega/g, 'Ω')
      .replace(/\\Delta/g, 'Δ')
      .replace(/\\mu/g, 'μ')
      .replace(/\\theta/g, 'θ')
      .replace(/\\pi/g, 'π')
      .replace(/\\omega/g, 'ω')
      .replace(/\\alpha/g, 'α')
      .replace(/\\beta/g, 'β')
      .replace(/\\gamma/g, 'γ')
      .replace(/\\phi/g, 'φ')
      .replace(/\\times/g, '×')
      .replace(/\\cdot/g, '·')
      .replace(/\\degree/g, '°')
      .replace(/\\angle/g, '∠')
      // Handle superscripts
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³');

    // 2. Identify and render LaTeX segments
    // We'll split the text by common delimiters: $$, $, \(, \), \[, \]
    // Note: This is a simple regex-based parser.
    const parts = processed.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$|\\\(.*?\\\)|\\\[.*?\\\])/g);

    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const formula = part.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(formula, { displayMode: true, throwOnError: false })
              }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const formula = part.slice(1, -1);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(formula, { displayMode: false, throwOnError: false })
              }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const formula = part.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(formula, { displayMode: false, throwOnError: false })
              }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const formula = part.slice(2, -2);
        try {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{
                __html: katex.renderToString(formula, { displayMode: true, throwOnError: false })
              }}
            />
          );
        } catch (e) {
          return <span key={index}>{part}</span>;
        }
      }
      
      // Plain text part: strip remaining curly braces often used in LaTeX but unwanted in final text
      return <span key={index}>{part.replace(/\{|\}/g, '')}</span>;
    });
  }, [text]);

  return <span className={className}>{content}</span>;
};
