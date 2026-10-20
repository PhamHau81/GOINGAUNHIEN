import React, { useEffect, useState, useMemo } from 'react';

// Declaration for KaTeX on window
declare global {
  interface Window {
    katex?: {
      renderToString: (
        tex: string,
        options?: {
          displayMode?: boolean;
          throwOnError?: boolean;
          strict?: boolean;
        }
      ) => string;
    };
  }
}

let katexLoadingPromise: Promise<boolean> | null = null;

/**
 * Ensures KaTeX stylesheet and script are injected and loaded
 */
function ensureKaTeXLoaded(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.katex) return Promise.resolve(true);

  if (katexLoadingPromise) return katexLoadingPromise;

  katexLoadingPromise = new Promise<boolean>((resolve) => {
    // 1. Inject KaTeX CSS if not already present
    if (!document.getElementById('katex-css-cdn')) {
      const link = document.createElement('link');
      link.id = 'katex-css-cdn';
      link.rel = 'stylesheet';
      link.href =
        'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }

    // 2. Inject KaTeX JS if not already present
    if (window.katex) {
      resolve(true);
      return;
    }

    let script = document.getElementById(
      'katex-js-cdn'
    ) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'katex-js-cdn';
      script.src =
        'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js';
      script.crossOrigin = 'anonymous';
      script.defer = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => resolve(true), { once: true });
      script.addEventListener('error', () => resolve(false), { once: true });
    }
  });

  return katexLoadingPromise;
}

/**
 * Clean up common MathType / Word quirks into standard LaTeX
 */
function normalizeMathExpression(raw: string): string {
  let tex = raw.trim();

  // Multi-letter vector \vec{AB} -> \overrightarrow{AB}
  // In KaTeX and standard Vietnamese mathematics curriculum (SGK),
  // \vec on multi-letter points only accents a single letter or remains narrow.
  // \overrightarrow{AB} creates a full-width extensible arrow spanning all letters.
  tex = tex.replace(/\\vec\{([A-Za-z]{2,})\}/g, '\\overrightarrow{$1}');

  // Unbraced multi-letter vector \vec AB -> \overrightarrow{AB}
  tex = tex.replace(/\\vec\s+([A-Z]{2,})(?![a-zA-Z])/g, '\\overrightarrow{$1}');

  // Unbraced single-letter vector \vec u -> \vec{u}
  tex = tex.replace(/\\vec\s+([a-zA-Z0-9])(?![a-zA-Z0-9])/g, '\\vec{$1}');

  // Vector command synonyms: \vecto{...}, \vector{...}, \vect{...}
  tex = tex.replace(/\\vect(?:or|o)?\{([A-Za-z]{2,})\}/g, '\\overrightarrow{$1}');
  tex = tex.replace(/\\vect(?:or|o)?\{([^}]+)\}/g, '\\vec{$1}');

  // Handle Unicode combining right arrow above (U+20D7: \u20D7)
  // e.g. AB⃗ -> \overrightarrow{AB}, u⃗ -> \vec{u}
  tex = tex.replace(/([A-Z]{2,})\u20D7/g, '\\overrightarrow{$1}');
  tex = tex.replace(/([a-zA-Z0-9])\u20D7/g, '\\vec{$1}');

  // Handle arrow suffix notation e.g. AB-> or AB→
  tex = tex.replace(/([A-Z]{2,})[ \t]*(?:->|→)/g, '\\overrightarrow{$1}');
  tex = tex.replace(/([a-z0-9])[ \t]*(?:->|→)/g, '\\vec{$1}');

  // Vector dot product (tích vô hướng) between vectors:
  // e.g. \vec{u} . \vec{v} or \overrightarrow{AB} . \overrightarrow{AC}
  tex = tex.replace(
    /(\\(?:vec|overrightarrow)\{[^}]+\})\s*[\.·\*]\s*(\\(?:vec|overrightarrow)\{[^}]+\})/g,
    '$1 \\cdot $2'
  );

  // Handle MathType overline / bar (e.g. P̄ -> \overline{P})
  tex = tex.replace(/([A-Za-z])\u0304/g, '\\overline{$1}');
  tex = tex.replace(/([A-Za-z])\u0305/g, '\\overline{$1}');
  tex = tex.replace(/P̄/g, '\\overline{P}');

  // Unicode superscripts to LaTeX powers
  tex = tex
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/⁰/g, '^0')
    .replace(/ⁿ/g, '^n')
    .replace(/⁻¹/g, '^{-1}');

  // Unicode subscripts to LaTeX subscripts
  tex = tex
    .replace(/₁/g, '_1')
    .replace(/₂/g, '_2')
    .replace(/₃/g, '_3')
    .replace(/₄/g, '_4')
    .replace(/₀/g, '_0');

  // Unicode math symbols to LaTeX equivalents if helpful
  tex = tex
    .replace(/≤/g, ' \\le ')
    .replace(/≥/g, ' \\ge ')
    .replace(/≠/g, ' \\ne ')
    .replace(/±/g, ' \\pm ')
    .replace(/∈/g, ' \\in ')
    .replace(/∉/g, ' \\notin ')
    .replace(/⊂/g, ' \\subset ')
    .replace(/∪/g, ' \\cup ')
    .replace(/∩/g, ' \\cap ')
    .replace(/∅/g, ' \\emptyset ')
    .replace(/ℝ/g, ' \\mathbb{R} ')
    .replace(/ℤ/g, ' \\mathbb{Z} ')
    .replace(/ℕ/g, ' \\mathbb{N} ')
    .replace(/ℚ/g, ' \\mathbb{Q} ')
    .replace(/∀/g, ' \\forall ')
    .replace(/∃/g, ' \\exists ')
    .replace(/→/g, ' \\to ')
    .replace(/∞/g, ' \\infty ')
    .replace(/√\(([^)]+)\)/g, ' \\sqrt{$1} ')
    .replace(/√([0-9a-zA-Z]+)/g, ' \\sqrt{$1} ');

  return tex;
}

/**
 * Pure HTML/CSS fallback if KaTeX is not loaded
 */
function renderFallbackMath(tex: string): string {
  let display = tex
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[3\]\{([^}]+)\}/g, '∛($1)')
    .replace(/\\overline\{([^}]+)\}/g, '$1\u0304')
    .replace(/\\overrightarrow\{([^}]+)\}/g, '$1⃗')
    .replace(/\\vec\{([^}]+)\}/g, '$1⃗')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\infty/g, '∞')
    .replace(/\\mathbb\{R\}/g, 'ℝ')
    .replace(/\\mathbb\{Z\}/g, 'ℤ')
    .replace(/\\mathbb\{N\}/g, 'ℕ')
    .replace(/\\mathbb\{Q\}/g, 'ℚ')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\forall/g, '∀')
    .replace(/\\exists/g, '∃')
    .replace(/\\le/g, '≤')
    .replace(/\\ge/g, '≥')
    .replace(/\\ne/g, '≠')
    .replace(/\\pm/g, '±')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\^([0-9a-zA-Z]+)/g, '<sup>$1</sup>')
    .replace(/\^\{([^}]+)\}/g, '<sup>$1</sup>')
    .replace(/_([0-9a-zA-Z]+)/g, '<sub>$1</sub>')
    .replace(/_\{([^}]+)\}/g, '<sub>$1</sub>');

  return `<span class="italic font-serif font-medium text-cyan-200">${display}</span>`;
}

interface Segment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Tokenize text into regular text and MathType/LaTeX math segments
 */
function tokenizeText(text: string): Segment[] {
  if (!text) return [];

  // Match:
  // 1. $$ ... $$
  // 2. $ ... $
  // 3. \[ ... \]
  // 4. \( ... \)
  // 5. Standalone LaTeX commands if pasted without delimiters
  const mathRegex =
    /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      });
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('$$') && fullMatch.endsWith('$$')) {
      segments.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2),
      });
    } else if (fullMatch.startsWith('$') && fullMatch.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: fullMatch.slice(1, -1),
      });
    } else if (fullMatch.startsWith('\\[') && fullMatch.endsWith('\\]')) {
      segments.push({
        type: 'block-math',
        content: fullMatch.slice(2, -2),
      });
    } else if (fullMatch.startsWith('\\(') && fullMatch.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: fullMatch.slice(2, -2),
      });
    }

    lastIndex = match.index + fullMatch.length;
  }

  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  // Second pass on text segments: Check if the text contains unwrapped LaTeX like \frac{...}{...}, \sqrt{...}, \overrightarrow{...}, or \vec{...}
  const finalSegments: Segment[] = [];
  const unwrappedLatexRegex =
    /(\\frac\{[^{}]+\}\{[^{}]+\}|\\sqrt(?:\[\d+\])?\{[^{}]+\}|\\overrightarrow\{[^{}]+\}|\\vec\{[^{}]+\}|\\vect(?:or|o)?\{[^{}]+\}|\\vec\s+[a-zA-Z0-9]+|[a-zA-Z0-9]+\u20D7)/g;

  for (const seg of segments) {
    if (seg.type !== 'text') {
      finalSegments.push(seg);
      continue;
    }

    let subLastIndex = 0;
    let subMatch: RegExpExecArray | null;
    let hasUnwrapped = false;

    while ((subMatch = unwrappedLatexRegex.exec(seg.content)) !== null) {
      hasUnwrapped = true;
      if (subMatch.index > subLastIndex) {
        finalSegments.push({
          type: 'text',
          content: seg.content.slice(subLastIndex, subMatch.index),
        });
      }
      finalSegments.push({
        type: 'inline-math',
        content: subMatch[0],
      });
      subLastIndex = subMatch.index + subMatch[0].length;
    }

    if (hasUnwrapped) {
      if (subLastIndex < seg.content.length) {
        finalSegments.push({
          type: 'text',
          content: seg.content.slice(subLastIndex),
        });
      }
    } else {
      finalSegments.push(seg);
    }
  }

  return finalSegments;
}

export interface MathRendererProps {
  text?: string;
  className?: string;
  inline?: boolean;
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text = '',
  className = '',
  inline = false,
}) => {
  const [katexLoaded, setKatexLoaded] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!window.katex;
  });

  useEffect(() => {
    if (!katexLoaded) {
      ensureKaTeXLoaded().then((loaded) => {
        if (loaded) setKatexLoaded(true);
      });
    }
  }, [katexLoaded]);

  const segments = useMemo(() => tokenizeText(text), [text]);

  if (!text) return null;

  return (
    <span
      className={`math-rendered-container ${
        inline ? 'inline' : 'inline-block'
      } ${className}`}
    >
      {segments.map((seg, idx) => {
        if (seg.type === 'text') {
          // If pure text contains common Unicode math symbols, render them nicely
          return <React.Fragment key={idx}>{seg.content}</React.Fragment>;
        }

        const isBlock = seg.type === 'block-math' && !inline;
        const normalizedTex = normalizeMathExpression(seg.content);

        if (katexLoaded && window.katex) {
          try {
            const html = window.katex.renderToString(normalizedTex, {
              displayMode: isBlock,
              throwOnError: false,
              strict: false,
            });
            return (
              <span
                key={idx}
                className={`katex-math-wrapper ${
                  isBlock ? 'block my-2 text-center' : 'inline-block mx-0.5'
                }`}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            // KaTeX render fallback
            const fallbackHtml = renderFallbackMath(normalizedTex);
            return (
              <span
                key={idx}
                className="math-fallback inline-block mx-0.5"
                dangerouslySetInnerHTML={{ __html: fallbackHtml }}
              />
            );
          }
        }

        // Before KaTeX loads
        const fallbackHtml = renderFallbackMath(normalizedTex);
        return (
          <span
            key={idx}
            className="math-fallback inline-block mx-0.5"
            dangerouslySetInnerHTML={{ __html: fallbackHtml }}
          />
        );
      })}
    </span>
  );
};

export default MathRenderer;
