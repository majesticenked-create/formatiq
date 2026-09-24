'use client';

import { useMemo, useState } from 'react';

const SAMPLE = `.card {\n  padding: 16px;\n  border-radius: 8px;\n  background: #ffffff;\n}\n\n.card__title {\n  font-size: 18px;\n  font-weight: 600;\n}\n`;

interface ValidationIssue {
  message: string;
}

/**
 * Inserts the CSS into a hidden <style> element and inspects the resulting CSSOM
 * (CSSStyleSheet.cssRules) via the browser's own CSS parser. This is a heuristic, not a
 * conformance checker: browsers are deliberately lenient with CSS - a malformed declaration or
 * rule is usually just skipped rather than rejected, so this reports rules that failed to
 * register at all (a strong signal of a structural break like an unclosed brace) rather than
 * claiming full W3C-spec validation. It is honest about that scope in its own copy below.
 */
function validateCss(input: string): { ok: true; ruleCount: number } | { ok: false; issues: ValidationIssue[] } {
  const style = document.createElement('style');
  style.textContent = input;
  document.head.appendChild(style);

  try {
    const sheet = style.sheet;
    const issues: ValidationIssue[] = [];

    if (!sheet) {
      issues.push({ message: 'The browser rejected this stylesheet outright and produced no CSSOM at all.' });
      return { ok: false, issues };
    }

    let ruleCount = 0;
    try {
      ruleCount = sheet.cssRules.length;
    } catch {
      issues.push({ message: 'Could not read parsed rules from the stylesheet.' });
      return { ok: false, issues };
    }

    // Heuristic: count "{" and "}" - a real mismatch (e.g. an unclosed rule) means the parser
    // had to silently drop content, which typically shows up as fewer top-level rules than the
    // brace count implies, or zero rules for clearly non-empty, brace-containing input.
    const openBraces = (input.match(/{/g) ?? []).length;
    const closeBraces = (input.match(/}/g) ?? []).length;

    if (openBraces !== closeBraces) {
      issues.push({
        message: `Mismatched braces: ${openBraces} "{" vs ${closeBraces} "}" - likely an unclosed (or extra-closed) rule.`,
      });
    }

    if (input.trim() && openBraces > 0 && ruleCount === 0) {
      issues.push({ message: 'The stylesheet contains braces but the browser parsed zero rules from it.' });
    }

    if (issues.length > 0) {
      return { ok: false, issues };
    }

    return { ok: true, ruleCount };
  } finally {
    document.head.removeChild(style);
  }
}

function tryValidate(input: string) {
  if (!input.trim()) {
    return { ok: false as const, message: 'Paste some CSS to validate.' };
  }
  if (typeof document === 'undefined') {
    return { ok: false as const, message: 'Loading...' };
  }

  const result = validateCss(input);
  if (result.ok) {
    return { ok: true as const, ruleCount: result.ruleCount };
  }
  return { ok: false as const, message: result.issues.map((i) => i.message).join(' ') };
}

export default function CssValidator() {
  const [input, setInput] = useState(SAMPLE);

  const result = useMemo(() => tryValidate(input), [input]);

  return (
    <div>
      <div className="control-row">
        <button className="icon-btn" onClick={() => setInput(SAMPLE)}>
          Load sample
        </button>
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-bar">
            <span>Input</span>
            <div className="panel-actions">
              <button className="icon-btn" onClick={() => setInput('')}>
                Clear
              </button>
            </div>
          </div>
          <textarea
            className="mono"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="Paste CSS here..."
          />
        </div>

        <div className="panel">
          <div className="panel-bar">
            <span>Validation result</span>
          </div>
          <div className="output mono">
            {result.ok
              ? `✓ Parsed cleanly - ${result.ruleCount} top-level rule${result.ruleCount === 1 ? '' : 's'} registered.`
              : `✗ ${result.message}`}
          </div>
          <div className={`status-line ${result.ok ? 'status-valid' : 'status-invalid'}`}>
            {result.ok ? '✓ No structural issues detected' : '✗ Possible structural issue'}
          </div>
        </div>
      </div>

      <div className="status-line status-neutral" style={{ marginTop: 12 }}>
        Checks structure, not full W3C conformance: this inserts your CSS into the browser&apos;s own CSS parser
        (via the CSSOM) and looks for signs a rule failed to register - like mismatched braces or a stylesheet that
        parses to zero rules despite containing them. Browsers are intentionally lenient and silently skip
        unrecognized declarations rather than erroring, so this catches malformed rule structure (an unclosed{' '}
        <code>{`{`}</code>, for example) rather than every possible spec violation. Just want clean formatting
        instead? Use the <a href="/tools/formatters/css-formatter">CSS Formatter</a>, or the{' '}
        <a href="/tools/formatters/css-minifier">CSS Minifier</a> to compact it.
      </div>
    </div>
  );
}
